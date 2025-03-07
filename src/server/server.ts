'use strict'

import express, { Request, Response } from 'express'
import path from 'path'
import multer from 'multer'
import bcrypt from 'bcrypt'
import cookieParser from 'cookie-parser'

import session from 'express-session'
import levenshtein from 'js-levenshtein'
import bodyParser from 'body-parser'
import { CSVColumnDef, diff, parseCsv } from '../shared/util/functions.js'

import { Category, ConfigurationKey, Prisma, PrismaClient } from '@prisma/client'

import { RecentMatches, ApiResponse, StateMatches, Match, StudentAggregates, FullState, SearchResult, SearchResultMatch, SearchResultStudent, FullStudentPerformance, SearchResultSchool, TeamPerformance, SchoolPage, TeamSeasons, SchoolTeam, StudentPage, StudentSeasons, SchoolSeasonPage, LoginResult, EditResult, MergeSuggestion, MatchPreviews, StudentLeaderboard, StudentLeaders, TeamLeaderboard } from '../shared/types/response.js'
import { CreateUserCredentials, LoginCredentials, MatchMetadata, SchoolMetadata, StudentMetadata, StudentPerformance, TeamPerformance as TeamPerformanceRequest } from '../shared/types/request.js'
import ConnectPgSimple from 'connect-pg-simple'
import pg from 'pg'
const { Pool } = pg

var app = express()
var router = express.Router()

var storage = multer.memoryStorage()
var upload = multer({ storage: storage })

const PgSession = ConnectPgSimple(session)
const pool = new Pool({
    user: process.env.DATABASE_USER,
    host: process.env.DATABASE_HOST,
    password: process.env.DATABASE_PW,
    database: process.env.DATABASE_DB || 'addb',
    port: parseInt(process.env.DATABASE_PORT || '5432')
})

import dotenv from 'dotenv'
import { divisions, eventOrdering, gpaOptions, subs as subList } from '../shared/util/consts.js'
dotenv.config()

const __dirname = path.resolve()

if (!process.env.SESSIONS_SECRET) {
    console.log(".env file not present! Crashing and burning")
    process.exit(1)
}

declare module "express-session" {
    interface SessionData {
        username: string,
        canEdit: boolean,
        access: number,
        userId: number
    }
}

interface AddbRequest<T> extends Request {
    auth?: boolean,
    access?: number,
    canEdit?: boolean,
    username?: string,
    userId?: number,
    body: T,
    files?: any
}

interface AddbResponse<T> extends Response {
    json: (value: ApiResponse<T>) => this
}

const prisma = new PrismaClient()

type RoundMap = {
    roundone: string,
    regionals: string,
    state: string,
    nationals: string
}

var roundMap: RoundMap = {
    roundone: 'Round One',
    regionals: 'Regionals',
    state: 'State',
    nationals: 'Nationals'
}

const getConfigStr = async (key: ConfigurationKey): Promise<string | null> => {
    return (await prisma.configuration.findFirst({
        where: {
            key: key
        }
    }))?.strValue || null
}

const getConfigInt = async (key: ConfigurationKey): Promise<number | null> => {
    return (await prisma.configuration.findFirst({
        where: {
            key: key
        }
    }))?.numValue || null
}

var port = process.env.API_PORT || 3001

app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }))
app.use(bodyParser.json({ limit: '50mb' }))
app.use(express.static(path.join(__dirname, "dist", "client")))
app.use(cookieParser())
app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSIONS_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000, sameSite: true }
}))

router.use(async function (req: AddbRequest<any>, _, next) {
    if (req.session.username) {
        req.auth = true
        req.access = req.session.access
        req.canEdit = req.session.canEdit
        req.username = req.session.username
        req.userId = req.session.userId
    } else {
        req.auth = false
        req.access = 1
        req.canEdit = false
    }
    next()
})

app.use(function (_, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE')
    res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, x-access-token')
    //and remove cacheing so we get the most recent comments
    res.setHeader('Cache-Control', 'no-cache')
    next()
})

const deleteOrphans = async () => {
    await prisma.team.deleteMany({
        where: {
            studentPerformances: {
                none: {}
            },
            performances: {
                none: {}
            }
        }
    })
    await prisma.student.deleteMany({
        where: {
            performances: {
                none: {}
            }
        }
    })
}

router.get('/', async function (_: AddbRequest<null>, res: AddbResponse<string>) {
    res.json({ success: true, data: "api initi" })
})

router.route('/authenticate')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (req.auth) {
            await prisma.user.update({
                where: {
                    id: req.userId
                },
                data: {
                    lastLogin: new Date()
                }
            })
            res.json({
                success: true
            })
        } else {
            res.json({
                success: false
            })
        }
    })

router.route('/user')
    .post(async function (req: AddbRequest<CreateUserCredentials>, res: AddbResponse<null>) {
        if (!req.auth || !req.access || req.access < 4) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        let username = req.body.username
        let password = req.body.password
        let access = req.body.access
        let canEdit = req.body.canEdit

        const saltRounds = 10
        const salt = await bcrypt.genSalt(saltRounds)
        const hash = await bcrypt.hash(password || '', salt)

        const result = await prisma.user.findFirst({
            where: {
                username: username
            }
        })

        if (result) {
            res.json({ success: false, message: 'Already a user with that username!' })
            return
        }

        await prisma.user.create({
            data: {
                username: username,
                passhash: hash,
                access: access,
                canEdit: canEdit
            }
        })

        res.json({ success: true, message: 'User successfully added!' })
    })

router.route('/login')
    .post(async function (req: AddbRequest<LoginCredentials>, res: AddbResponse<LoginResult>) {

        const user = await prisma.user.findFirst({
            where: {
                username: req.body.username
            }
        })

        if (!user) {
            res.json({ success: false, message: "No user with that username!" })
            return
        }

        const result = await bcrypt.compare(req.body.password, user.passhash)
        if (!result) {
            res.json({ success: false, message: "Incorrect password!" })
            return
        } else {
            req.session.access = user.access
            req.session.canEdit = user.canEdit
            req.session.username = user.username
            req.session.userId = user.id
            res.json({ success: true, data: { expiresIn: 30 * 24 * 60 * 60 * 1000, canEdit: user.canEdit, access: user.access, username: user.username } })
        }
    })

router.route('/logout')
    .get(function (req, res) {
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    res.json({ success: false, message: 'Failed to kill session' })
                } else {
                    res.json({ success: true })
                }
            })
        }
    })

router.route('/search')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<SearchResult>) {

        let results = {
            schools: new Array<SearchResultSchool>(),
            students: new Array<SearchResultStudent>(),
            matches: new Array<SearchResultMatch>()
        }

        if (!req.query.query || req.query.query.toString().length < 3) {
            res.json({ success: false, message: "Query too short" })
            return
        }
        const query = req.query.query.toString()

        let limit = req.query.limit ? parseInt(req.query.limit.toString()) : 100
        const schools = await prisma.school.findMany({
            where: {
                OR: [
                    {
                        name: {
                            startsWith: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        fullName: {
                            startsWith: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            include: {
                region: true,
                state: true
            },
            take: limit
        })

        const students = await prisma.student.findMany({
            where: {
                name: {
                    contains: query,
                    mode: 'insensitive'
                }
            },
            include: {
                performances: {
                    select: {
                        team: {
                            select: {
                                school: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        match: {
                            date: 'desc'
                        }
                    },
                    take: 1
                }
            },
            take: limit
        })

        const matches = await prisma.match.findMany({
            select: {
                id: true,
                year: true,
                round: true,
                state: true,
                region: true,
                site: true
            },
            where: {
                OR: [
                    {
                        search1: {
                            startsWith: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        search2: {
                            startsWith: query,
                            mode: 'insensitive'
                        }
                    },
                    {
                        search3: {
                            startsWith: query,
                            mode: 'insensitive'
                        }
                    }
                ]
            },
            take: limit
        })

        results.schools = schools
        results.students = students
        results.matches = matches

        res.json({ success: true, data: results })

    })

var studentUpload = upload.fields([{ name: 'studentData', maxCount: 1 }])
router.route('/match/:id/studentcsv')
    .post(studentUpload, async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const matchId = parseInt(req.params.id)
        const match = await prisma.match.findFirst({
            where: {
                id: matchId
            }
        })

        if (!match) {
            res.json({
                success: false,
                message: 'Match not found'
            })
            return
        }

        if (!req.files['studentData'][0]) {
            res.json({
                success: false,
                message: "No CSV included"
            })
            return
        }

        let studentCols: CSVColumnDef[] = [
            {
                name: 'teamName',
                type: 'string'
            },
            {
                name: 'teamNumber',
                type: 'int'
            },
            {
                name: 'gpa',
                type: 'string'
            },
            {
                name: 'studentName',
                type: 'string'
            }
        ]

        studentCols = studentCols.concat(match.events.map(event => ({ name: event, type: 'float' })))

        const csvParseResult = parseCsv(req.files['studentData'][0].buffer.toString(), studentCols)
        if (!csvParseResult.success) {
            res.json({ success: false, message: csvParseResult.message })
            return
        }

        type StudentPerformanceInput = {
            studentId?: number,
            matchId: number,
            teamId: number,
            gpa: string,
            overall: number,
            math?: number,
            music?: number,
            econ?: number,
            science?: number,
            lit?: number,
            fine?: number,
            art?: number,
            socialScience?: number,
            sq?: number,
            essay?: number,
            speech?: number,
            interview?: number,
            objs?: number,
            subs?: number
        }

        const studentData = csvParseResult.data || []
        let perfsToCreate: StudentPerformanceInput[] = []
        let teamNumberToObj: { [number: number]: Prisma.TeamGetPayload<{}> } = {}
        let teamNumberToName: { [number: number]: string } = {}
        let i = 0
        for (const row of studentData) {
            i += 1
            let overall = 0
            let objs = 0
            let subs = 0
            let teamId: number
            let studentId: number | null = null
            match.events.forEach(event => {
                overall += row[event] as number
                if (subList.includes(event)) subs += row[event] as number
                else objs += row[event] as number
            })

            if (!(row.gpa.toString().toUpperCase() in gpaOptions)) {
                res.json({ success: false, message: `Encountered unsupported GPA ${row.gpa.toString().toUpperCase()} in row ${i}. GPA must be H, S, V, A, B, or C.` })
                return
            }

            row.gpa = gpaOptions[row.gpa.toString().toUpperCase()]

            if (!(row.teamNumber in teamNumberToObj)) {
                const team = (await prisma.teamPerformance.findFirst({
                    where: {
                        matchId: match.id,
                        team: {
                            name: row.teamName as string
                        }
                    },
                    include: {
                        team: true
                    }
                }))?.team

                if (!team) {
                    res.json({
                        success: false,
                        message: `Student ${row.studentName} listed under ${row.teamName}, but this team was not found in the match.`
                    })
                    return
                }

                teamNumberToObj[row.teamNumber as number] = team
                teamNumberToName[row.teamNumber as number] = row.teamName as string
                teamId = team.id
            } else {
                if (teamNumberToName[row.teamNumber as number] != row.teamName) {
                    res.json({
                        success: false,
                        message: `Found conflicting team names for team ${row.teamNumber}: ${row.teamName} and ${teamNumberToName[row.teamNumber as number]}`
                    })
                    return
                }
                teamId = teamNumberToObj[row.teamNumber as number].id
            }

            if (row.studentName) {
                const student = await prisma.student.findFirst({
                    where: {
                        name: row.studentName as string,
                        performances: {
                            some: {
                                OR: [
                                    {
                                        teamId: teamId,
                                    },
                                    {
                                        team: {
                                            schoolId: teamNumberToObj[row.teamNumber as number].schoolId
                                        }
                                    },
                                    {
                                        team: {
                                            school: {
                                                name: row.teamName as string
                                            }
                                        }
                                    },
                                    {
                                        team: {
                                            name: row.teamName as string
                                        }
                                    }
                                ],
                                match: {
                                    year: {
                                        gte: match.year - 4,
                                        lte: match.year + 4
                                    }
                                }
                            }
                        }
                    }
                })

                if (student) {
                    studentId = student.id
                } else {
                    studentId = (await prisma.student.create({
                        data: {
                            name: row.studentName as string
                        }
                    })).id
                }
            }

            let perfToCreate: StudentPerformanceInput = {
                studentId: studentId || undefined,
                teamId: teamId,
                matchId: match.id,
                gpa: row.gpa as string,
                overall: overall,
                objs: objs,
                subs: subs
            }
            match.events.forEach(event => perfToCreate[event] = row[event] as number)

            perfsToCreate.push(perfToCreate)
        }

        const teamPromises = Object.keys(teamNumberToObj).map(number => {
            return prisma.teamPerformance.updateMany({
                where: {
                    teamId: teamNumberToObj[parseInt(number)].id as number,
                    matchId: match.id
                },
                data: {
                    number: parseInt(number)
                }
            })
        })

        const studentPromises = perfsToCreate.map(perf => {
            return prisma.studentPerformance.create({
                data: perf
            })
        })

        await Promise.all(teamPromises)
        await Promise.all(studentPromises)

        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Upload Student Data for Match ${match.search1}`
            }
        })

        res.json({ success: true })

    })

var teamUpload = upload.fields([{ name: 'teamData', maxCount: 1 }])
router.route('/match/:id/teamcsv')
    .post(teamUpload, async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const matchId = parseInt(req.params.id)
        const match = await prisma.match.findFirst({
            where: {
                id: matchId
            }
        })

        if (!match) {
            res.json({
                success: false,
                message: "Match not found"
            })
            return
        }

        if (!req.files['teamData'][0]) {
            res.json({
                success: false,
                message: "No CSV included"
            })
            return
        }

        let teamCols: CSVColumnDef[] = [
            {
                name: 'rank',
                type: 'int'
            },
            {
                name: 'team',
                type: 'string',
            },
            {
                name: 'overall',
                type: 'float'
            },
            {
                name: 'objs',
                type: 'float'
            },
            {
                name: 'subs',
                type: 'float'
            }
        ]
        if (match.hasSq) {
            teamCols.push({
                name: 'sq',
                type: 'float'
            })
        }
        if (match.hasDivisions) {
            teamCols.push({
                name: 'division',
                type: 'string'
            })
        }

        const csvParseResult = parseCsv(req.files['teamData'][0].buffer.toString(), teamCols)
        if (!csvParseResult.success) {
            res.json({ success: false, message: csvParseResult.message })
            return
        }

        const teamData = csvParseResult.data || []

        for (const row of teamData) {
            if (match.hasDivisions && !(row.division in divisions)) {
                res.json({ success: false, message: `Encountered unsupported division label ${row.division}.` })
                return
            }
        }

        const teamDbCalls = teamData.map(row => {
            return prisma.team.findFirst({
                where: {
                    name: row.team as string,
                    school: {
                        stateId: match.stateId
                    }
                }
            })
        })

        const suggestedTeams = await Promise.all(teamDbCalls)

        for (let i = 0; i < teamData.length; i++) {

            const teamId = suggestedTeams[i]?.id ||
                (await prisma.team.create({
                    data: {
                        name: teamData[i].team as string
                    }
                })).id

            const data = {
                matchId: matchId,
                rank: teamData[i].rank as number,
                teamId: teamId,
                overall: teamData[i].overall as number,
                objs: teamData[i].objs as number,
                subs: teamData[i].subs as number,
                division: teamData[i].division as string,
                sq: teamData[i].sq as number
            }

            await prisma.teamPerformance.create({
                data: data
            })
        }

        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Upload Team Data for Match ${match.search1}`
            }
        })

        res.json({ success: true })
    })

router.route('/states')
    .get(async function (_: AddbRequest<null>, res: AddbResponse<FullState[]>) {
        const results = await prisma.state.findMany({
            include: {
                regions: true
            }
        })

        res.json({ success: true, data: results })
    })

router.route('/match/:id')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<Match>) {
        const id = parseInt(req.params.id)
        if (!id) {
            res.json({ success: false })
            return
        }

        let access = (await prisma.match.findFirst({
            where: {
                id: id
            },
            select: {
                access: true
            }
        }))?.access

        if (!access) {
            res.json({ success: false })
            return
        }

        const redacted = !req.access || req.access < access
        let match: Match
        if (redacted) {
            match = await prisma.match.findFirst({
                where: {
                    id: id
                },
                include: {
                    teamPerformances: {
                        include: {
                            team: {
                                include: {
                                    school: true
                                }
                            }
                        },
                        orderBy: {
                            rank: 'asc'
                        }
                    },
                    studentPerformances: {
                        select: {
                            student: true,
                            studentId: true,
                            id: true,
                            team: true,
                            teamId: true,
                            gpa: true,
                            overall: true,
                            matchId: true,
                            match: true
                        }
                    },
                    region: true,
                    state: true
                }
            })
            if (match) match.events = []
        } else {
            match = await prisma.match.findFirst({
                where: {
                    id: id
                },
                include: {
                    teamPerformances: {
                        include: {
                            team: {
                                include: {
                                    school: true
                                }
                            }
                        },
                        orderBy: {
                            rank: 'asc'
                        }
                    },
                    studentPerformances: {
                        include: {
                            student: true,
                            team: true,
                            match: true
                        }
                    },
                    region: true,
                    state: true
                }
            })
        }

        if (!match) {
            res.json({ success: false })
            return
        }

        let data: Match = { ...match }

        if (!redacted) {
            let aggs: StudentAggregates = {}
            let cols: string[] = [...match.events]
            cols.push('objs', 'subs', 'overall')
            for (const c of cols) {
                const c_ovr = (c == 'socialScience') ? 'social_science' : c
                const query = `
                    SELECT team_id, sum(${c_ovr}) as combinedscore
                        FROM (
                            SELECT team_id, ${c_ovr}, ROW_NUMBER() OVER (
                                PARTITION BY team_id, gpa ORDER BY ${c_ovr} DESC NULLS LAST
                            ) AS rank FROM student_performances WHERE match_id = ${id}) ranked 
                    WHERE rank <= 2
                    GROUP BY team_id;    
                `

                const result: { team_id: number, combinedscore: number }[] = await prisma.$queryRawUnsafe(query)
                result.forEach(entry => {
                    if (entry.team_id in aggs) {
                        aggs[entry.team_id][c] = entry.combinedscore
                    } else {
                        aggs[entry.team_id] = { [c]: entry.combinedscore }
                    }
                })
            }
            data.aggregates = aggs
        }

        res.json({ success: true, data: data })
    })
    .delete(async function (req: AddbRequest<null>, res: AddbResponse<Match>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const match = await prisma.match.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        await deleteOrphans()
        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Delete Match ${match.search1}`
            }
        })
        res.json({ success: true })
    })

// router.route('/match/:round/:state/:param1/:param2?')
//     .get(async function (req, res) {

//         let region, year
//         if (req.params.param2) {
//             region = req.params.param1
//             year = parseInt(req.params.param2)
//         } else {
//             region = undefined
//             year = req.params.param1
//         }
//         const state = req.params.state.replace('_', ' ')
//         const round = req.params.round.toLowerCase()
//         let searchTerm = {
//             year: year,
//             round: round,
//             state: {
//                 name: state
//             }
//         }
//         if (round === 'roundone' || round === 'regionals') {
//             if (!region) {
//                 res.json(null)
//                 return
//             }
//             searchTerm.region = {
//                 name: region.replace('_', ' ')
//             }
//         }

//         const match = await prisma.match.findFirst({
//             where: searchTerm,
//             include: {
//                 teamPerformances: {
//                     include: {
//                         student: true,
//                         team: true
//                     }
//                 },
//                 studentPerformances: {
//                     include: {
//                         student: true,
//                         team: true
//                     }
//                 },
//                 region: true,
//                 state: true,
//                 events: true
//             }
//         })

//         if (!match) {
//             res.json({ success: false })
//             return
//         }
//         if (req.access < match.access) {
//             match = removeBreakdownsFromMatch(match)
//         }
//         res.json(match)
//     })

router.route('/teamperformance/:id')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<TeamPerformance>) {
        const id = parseInt(req.params.id)
        const result = await prisma.teamPerformance.findFirst({
            where: {
                id: id
            },
            include: {
                team: {
                    include: {
                        school: true
                    }
                }
            }
        })

        if (result) {
            res.json({
                success: true,
                data: result
            })
        } else {
            res.json({
                success: false
            })
        }
    })

router.route('/studentperformance/:id')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<FullStudentPerformance>) {
        const id = parseInt(req.params.id)
        const result = await prisma.studentPerformance.findFirst({
            where: {
                id: id
            },
            include: {
                team: true,
                student: true,
                match: true
            }
        })

        if (result) {
            res.json({
                success: true,
                data: result
            })
        } else {
            res.json({
                success: false
            })
        }
    })

router.route('/teamperformance')
    .post(async function (req: AddbRequest<TeamPerformanceRequest>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: "Not authorized"
            })
            return
        }

        const { id } = req.body
        const data = {
            matchId: req.body.matchId,
            rank: req.body.rank,
            overall: req.body.overall,
            objs: req.body.objs,
            subs: req.body.subs,
            division: req.body.division,
            sq: req.body.sq,
            teamId: -1
        }
        if (id != undefined) {
            const perfToEdit = await prisma.teamPerformance.findFirst({
                where: {
                    id: id
                }, include: {
                    team: true,
                    match: true
                }
            })
            if (!perfToEdit) {
                res.json({
                    success: false,
                    message: 'Performance not found'
                })
                return
            }

            const currTeamId = perfToEdit.teamId

            const possibleTeam = await prisma.team.findFirst({
                where: {
                    name: req.body.teamName,
                    schoolId: req.body.schoolId
                }
            })

            if (possibleTeam) {
                data.teamId = possibleTeam.id
            } else {
                data.teamId = (await prisma.team.create({
                    data: {
                        name: req.body.teamName,
                        schoolId: req.body.schoolId
                    }

                })).id
            }

            const newPerf = await prisma.teamPerformance.update({
                where: {
                    id: id
                },
                data: data
            })

            const studentPerformances = await prisma.studentPerformance.updateManyAndReturn({
                where: {
                    matchId: perfToEdit.matchId,
                    teamId: currTeamId
                },
                data: {
                    teamId: data.teamId
                },
                include: {
                    student: true
                }
            })

            for (const studentPerf of studentPerformances) {
                const otherPerf = await prisma.studentPerformance.findFirst({
                    where: {
                        OR: [
                            {
                                teamId: data.teamId
                            },
                            {
                                team: {
                                    schoolId: req.body.schoolId
                                }
                            }
                        ],
                        id: {
                            not: studentPerf.id
                        },
                        studentId: {
                            not: null
                        },
                        student: {
                            name: studentPerf.student?.name
                        },
                        match: {
                            year: {
                                gte: perfToEdit.match.year - 4,
                                lte: perfToEdit.match.year + 4
                            }
                        }
                    }
                })
                if (otherPerf) {
                    await prisma.studentPerformance.update({
                        where: {
                            id: studentPerf.id
                        },
                        data: {
                            studentId: otherPerf.studentId
                        }
                    })
                    if (studentPerf.studentId) {
                        await prisma.student.delete({
                            where: {
                                id: studentPerf.studentId
                            }
                        })
                        await deleteOrphans()
                    }
                }
            }

            const { team, match, ...oldPerf } = perfToEdit
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Edit Team Performance for ${perfToEdit.team.name} at ${perfToEdit.match.search1} (match ${perfToEdit.matchId})`,
                    diff: JSON.stringify(diff(oldPerf, newPerf))
                }
            })
        } else {
            const possibleTeam = await prisma.team.findFirst({
                where: {
                    name: req.body.teamName,
                    schoolId: req.body.schoolId
                }
            })

            if (possibleTeam) {
                data.teamId = possibleTeam.id
            } else {
                const newTeam = await prisma.team.create({
                    data: {
                        name: req.body.teamName,
                        schoolId: req.body.schoolId
                    }

                })

                prisma.edit.create({
                    data: {
                        userId: req.userId || 0,
                        summary: `Create Team ${newTeam.name}`
                    }
                })

                data.teamId = newTeam.id
            }
            const newPerf = await prisma.teamPerformance.create({ data, include: { team: true, match: true } })
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Add Team Performance for ${newPerf.team.name} at ${newPerf.match.search1} (match ${newPerf.matchId})`
                }
            })
        }
        res.json({ success: true })
    })

router.route('/studentperformance')
    .post(async function (req: AddbRequest<StudentPerformance>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: "Not authorized"
            })
            return
        }

        const { id } = req.body

        if (id != undefined) {
            const perfToEdit = await prisma.studentPerformance.findFirst({
                where: {
                    id: id
                }
            })
            if (!perfToEdit) {
                res.json({
                    success: false,
                    message: "Performance not found"
                })
                return
            }
            const newPerf = await prisma.studentPerformance.update({
                where: {
                    id: id
                },
                include: {
                    student: true,
                    match: true
                },
                data: req.body
            })
            const { match, student, ...restOfNewPerf } = newPerf
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Edit Student Performance for ${newPerf.student?.name || '?'} at ${newPerf.match.search1} (match ${newPerf.matchId})`,
                    diff: JSON.stringify((diff(perfToEdit, restOfNewPerf)))
                }
            })
            res.json({
                success: true
            })
        } else {
            const newPerf = await prisma.studentPerformance.create({
                data: req.body,
                include: {
                    student: true,
                    match: true
                }
            })
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Create Student Performance for ${newPerf.student?.name || '?'} at ${newPerf.match.search1} (match ${newPerf.matchId})`
                }
            })
            res.json({
                success: true
            })
        }
    })

router.route('/match')
    .post(async function (req: AddbRequest<MatchMetadata>, res: AddbResponse<number>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: "Not authorized"
            })
            return
        }

        const { id } = req.body
        req.body.events.sort((a: Category, b: Category) => eventOrdering(req.body.year).indexOf(a) - eventOrdering(req.body.year).indexOf(b))

        if (req.body.newRegion) {
            if (!req.body.stateId) {
                res.json({ success: false, message: 'Cannot create new region without state' })
                return
            }
            const newRegionId = (await prisma.region.create({
                data: {
                    name: req.body.newRegion,
                    stateId: req.body.stateId
                }
            })).id
            req.body.regionId = newRegionId
            delete req.body.newRegion
        }

        if (id != undefined) {
            const matchToEdit = await prisma.match.findFirst({
                where: {
                    id: id
                }
            })
            if (!matchToEdit) {
                res.json({
                    success: false,
                    message: "Match not found"
                })
                return
            }
            const newMatch = await prisma.match.update({
                where: {
                    id: id
                },
                data: req.body
            })
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Edit Match ${newMatch.search1}`,
                    diff: JSON.stringify(diff(matchToEdit, newMatch))
                }
            })
            res.json({
                success: true,
                data: id
            })
        } else {
            const data: any = { ...req.body }

            let regionName: string | undefined
            let stateName: string | undefined

            if (data.round !== 'nationals') {
                if (data.round !== 'state') {
                    const region = await prisma.region.findFirst({
                        where: {
                            id: data.regionId
                        },
                        include: {
                            state: true
                        }
                    })
                    regionName = region?.name
                    stateName = region?.state.name
                } else {
                    const state = await prisma.state.findFirst({
                        where: {
                            id: data.stateId
                        }
                    })
                    stateName = state?.name
                }
            }

            data.search1 = `${data.year} ${data.round !== 'nationals' ? stateName + ' ' : ''}${data.round !== 'nationals' && data.round !== 'state' ? regionName + ' ' : ''}${roundMap[data.round as keyof RoundMap]}`
            data.search2 = `${data.year} ${roundMap[data.round as keyof RoundMap]} ${data.round !== 'nationals' ? stateName + ' ' : ''}${data.round !== 'nationals' && data.round !== 'state' ? regionName + ' ' : ''}`
            data.search3 = `${data.round !== 'nationals' ? stateName + ' ' : ''}${data.round !== 'nationals' && data.round !== 'state' ? regionName + ' ' : ''}${roundMap[data.round as keyof RoundMap]} ${data.year}`
            data.incompleteData = false
            const match = await prisma.match.create({
                data: data
            })
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Create Match ${match.search1}`
                }
            })
            res.json({
                success: true, data: match.id
            })
        }
    })

router.route('/school/:id')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<SchoolPage>) {
        const id = parseInt(req.params.id)
        if (!id) {
            res.json({ success: false, message: 'Need an ID' })
            return
        }
        const school = await prisma.school.findFirst({
            where: {
                id: id
            },
            include: {
                region: true,
                state: true
            }
        })

        if (!school) {
            res.json({ success: false, message: 'School not found' })
            return
        }

        let schoolTeams: Array<SchoolTeam> = []
        const teams = await prisma.team.findMany({
            where: {
                schoolId: school.id
            }
        })

        for (const team of teams) {
            let seasons: TeamSeasons = {}
            const performances = await prisma.teamPerformance.findMany({
                where: {
                    teamId: team.id
                },
                include: {
                    match: true
                }
            })
            for (const perf of performances) {
                if (perf.match.year in seasons) {
                    seasons[perf.match.year][perf.match.round] = perf
                } else {
                    seasons[perf.match.year] = { [perf.match.round]: perf }
                }
            }
            let teamData = {
                team: team,
                seasons: seasons
            }
            schoolTeams.push(teamData)
        }


        const rostersMaps: { [year: number]: { [id: number]: Prisma.StudentGetPayload<{}> | null } } = (await prisma.studentPerformance.findMany({
            where: {
                team: {
                    schoolId: school.id
                },
                studentId: {
                    not: null
                }
            },
            include: {
                match: true,
                student: true
            }
        })).reduce((prev, curr) => {
            if (curr.match.year in prev) {
                prev[curr.match.year][curr.studentId || 0] = curr.student
                return prev
            } else {
                return { ...prev, [curr.match.year]: { [curr.studentId || 0]: curr.student } }
            }
        }, {} as { [year: number]: { [studentId: number]: Prisma.StudentGetPayload<{}> | null } })

        const rosters: { [year: number]: Array<Prisma.StudentGetPayload<{}>> } = {}
        Object.keys(rostersMaps).map(Number).forEach(year => {
            rosters[year] = Object.values(rostersMaps[year]).filter(obj => obj != null)
        })

        res.json({ success: true, data: { school: school, teams: schoolTeams, rosters: rosters } })
    })
    .delete(async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const school = await prisma.school.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })

        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Delete School ${school.fullName || school.name}`
            }
        })

        res.json({
            success: true
        })
    })

router.route('/mergepeople/:godId/:peonId')
    .post(async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const godId = parseInt(req.params.godId)
        const peonId = parseInt(req.params.peonId)

        if (!godId || !peonId) {
            res.json({ success: false })
            return
        }

        const god = await prisma.student.findFirst({ where: { id: godId }, include: { performances: { include: { match: true } } } })
        const peon = await prisma.student.findFirst({ where: { id: peonId } })
        if (!god || !peon) {
            res.json({ success: false, message: 'Invalid ID' })
            return
        }

        // first, delete any overlapping matches on the peon side
        for (const perf of god.performances) {
            await prisma.studentPerformance.deleteMany({
                where: {
                    match: {
                        year: perf.match.year,
                        round: perf.match.round
                    },
                    studentId: peon.id
                }
            })
        }

        deleteOrphans()

        // now flip the peon's performances over to the god
        await prisma.studentPerformance.updateMany({
            where: {
                studentId: peon.id
            },
            data: {
                studentId: god.id
            }
        })

        // finally, delete the peon
        await prisma.student.delete({
            where: {
                id: peon.id
            }
        })

        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Merge Students ${god.name} and ${peon.name}`
            }
        })

        res.json({ success: true })
    })

router.route('/student')
    .post(async function (req: AddbRequest<StudentMetadata>, res: AddbResponse<SearchResultStudent>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const { id } = req.body

        let result: SearchResultStudent
        if (id != undefined) {
            const oldStudent = await prisma.student.findFirst({
                where: {
                    id: id
                }
            })

            if (!oldStudent) {
                res.json({ success: false, message: 'Student not found' })
                return
            }

            result = await prisma.student.update({
                where: {
                    id: id
                },
                data: req.body,
                include: {
                    performances: {
                        select: {
                            team: {
                                select: {
                                    school: true
                                }
                            }
                        },
                        orderBy: {
                            match: {
                                date: 'desc'
                            }
                        },
                        take: 1
                    }
                }
            })

            const { performances, ...newStudent } = result
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Edit Student ${newStudent.name}`,
                    diff: JSON.stringify(diff(oldStudent, newStudent))
                }
            })
        } else {
            result = await prisma.student.create({
                data: req.body,
                include: {
                    performances: {
                        select: {
                            team: {
                                select: {
                                    school: true
                                }
                            }
                        },
                        orderBy: {
                            match: {
                                date: 'desc'
                            }
                        },
                        take: 1
                    }
                }
            })
            prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Create Student ${result.name}`
                }
            })
        }

        res.json({ success: true, data: result })
    })

router.route('/student/:id')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<StudentPage>) {
        const id = parseInt(req.params.id)
        if (!id) {
            res.json({ success: false })
            return
        }
        const student = await prisma.student.findFirst({
            where: {
                id: id
            }
        })

        if (!student) {
            res.json({
                success: false, message: 'Student not found'
            })
            return
        }

        const school = (await prisma.studentPerformance.findFirst({
            where: {
                studentId: student.id
            },
            orderBy: {
                match: {
                    date: 'desc'
                }
            },
            include: {
                team: {
                    include: {
                        school: {
                            include: {
                                state: true
                            }
                        }
                    }
                }
            }
        }))?.team.school

        let seasons: StudentSeasons = {}
        const performances = await prisma.studentPerformance.findMany({
            where: {
                studentId: id
            },
            include: {
                match: true,
                team: true
            }
        })
        for (const perf of performances) {
            const [{ rank: rank }] = await prisma.$queryRaw<{ rank: BigInt }[]>`SELECT rank FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY overall DESC NULLS LAST) AS rank FROM student_performances WHERE match_id=${perf.matchId} AND gpa=${perf.gpa}) AS sub WHERE sub.id = ${perf.id}`
            let rankedPerf = perf as Prisma.StudentPerformanceGetPayload<{ include: { team: true } }> & { rank?: number }
            rankedPerf.rank = Number(rank) - 1
            console.log(rank)
            if (perf.match.year in seasons) {
                seasons[perf.match.year][perf.match.round] = rankedPerf
            } else {
                seasons[perf.match.year] = { [perf.match.round]: rankedPerf }
            }
        }

        res.json({
            success: true, data: {
                student: student,
                school: school,
                seasons: seasons
            }
        })

    })
    .delete(async function (req: AddbRequest<null>, res: AddbResponse<null>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const student = await prisma.student.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })

        await prisma.edit.create({
            data: {
                userId: req.userId || 0,
                summary: `Delete Student ${student.name}`
            }
        })

        res.json({
            success: true
        })
    })

router.route('/nationals')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<MatchPreviews>) {

        const limit = req.query.limit ? parseInt(req.query.limit.toString()) : 100

        const matches = await prisma.match.findMany({
            where: {
                round: 'nationals'
            },
            orderBy: {
                year: 'desc'
            },
            take: limit,
            include: {
                region: true,
                state: true,
                teamPerformances: {
                    include: {
                        team: {
                            include: {
                                school: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        overall: 'desc'
                    },
                    take: 3
                }
            }
        })

        res.json({ success: true, data: matches })
    })

router.route('/season_top_teams')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<TeamLeaderboard>) {
        const year = await getConfigInt('year')
        if (!year) {
            res.json({ success: false, message: 'What year is it???' })
            return
        }

        const result = await prisma.teamPerformance.findMany({
            where: {
                match: {
                    year: year
                }
            },
            orderBy: {
                overall: 'desc'
            },
            include: {
                team: {
                    include: {
                        school: {
                            include: {
                                state: true
                            }
                        }
                    }
                },
                match: true
            },
            take: 10
        })

        res.json({ success: true, data: { year: year, leaders: result } })
    })

router.route('/season_top_students')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<StudentLeaderboard>) {

        const year = await getConfigInt('year')
        if (!year) {
            res.json({ success: false, message: 'What year is it???' })
            return
        }

        let output: { [key: string]: Prisma.StudentPerformanceGetPayload<{ include: { student: true, team: { include: { school: { include: { state: true } } } }, match: { include: { region: true, state: true } } } }>[] } = { H: [], S: [], V: [] }
        for (const gpa of ['H', 'S', 'V']) {
            const perfs = await prisma.studentPerformance.findMany({
                where: {
                    match: {
                        year: year
                    },
                    gpa: gpa
                },
                orderBy: {
                    overall: 'desc'
                },
                include: {
                    student: true,
                    match: {
                        include: {
                            region: true,
                            state: true
                        }
                    },
                    team: {
                        include: {
                            school: {
                                include: {
                                    state: true
                                }
                            }
                        }
                    }
                },
                take: 10
            })
            output[gpa] = perfs
        }

        res.json({
            success: true, data: {
                year: year,
                leaders: output as StudentLeaders
            }
        })
    })

router.route('/school')
    .post(async function (req: AddbRequest<SchoolMetadata>, res: AddbResponse<SearchResultSchool>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const { id } = req.body

        if (req.body.newRegion) {
            if (!req.body.stateId) {
                res.json({ success: false, message: 'Cannot create new region without state' })
                return
            }
            const newRegionId = (await prisma.region.create({
                data: {
                    name: req.body.newRegion,
                    stateId: req.body.stateId
                }
            })).id
            req.body.regionId = newRegionId
            delete req.body.newRegion
        }

        let result: SearchResultSchool
        if (id != undefined) {
            const myOldSchool = await prisma.school.findFirst({
                where: {
                    id: id
                }
            })

            if (!myOldSchool) {
                res.json({ success: false, message: 'School not found' })
                return
            }

            result = await prisma.school.update({
                where: {
                    id: id
                },
                data: req.body,
                include: {
                    region: true,
                    state: true
                }
            })

            const { region, state, ...newSchool } = result
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Edit School ${newSchool.fullName || newSchool.name}`,
                    diff: JSON.stringify(diff(myOldSchool, newSchool))
                }
            })
        } else {
            result = await prisma.school.create({
                data: req.body,
                include: {
                    region: true,
                    state: true
                }
            })
            await prisma.edit.create({
                data: {
                    userId: req.userId || 0,
                    summary: `Create School ${result.fullName || result.name}`
                }
            })
        }

        res.json({ success: true, data: result })
    })

router.route('/edits')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<Array<EditResult>>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const cursor = parseInt(req.query.cursor?.toString() || '')

        let edits: EditResult[]
        if (cursor) {
            edits = await prisma.edit.findMany({
                orderBy: {
                    datetime: 'desc'
                },
                take: 10,
                skip: 1,
                cursor: {
                    id: cursor
                },
                include: {
                    user: true
                }
            })
        } else {
            edits = await prisma.edit.findMany({
                orderBy: {
                    datetime: 'desc'
                },
                take: 10,
                include: {
                    user: true
                }
            })
        }

        res.json({
            success: true,
            data: edits
        })
    })

router.route('/recent')
    .get(async function (_: AddbRequest<null>, res: AddbResponse<MatchPreviews>) {
        const results = await prisma.match.findMany({
            include: {
                region: true,
                state: true,
                teamPerformances: {
                    include: {
                        team: {
                            include: {
                                school: {
                                    include: {
                                        state: true
                                    }
                                }
                            }
                        }
                    },
                    take: 3
                }
            },
            orderBy: {
                date: 'desc'
            },
            take: 10
        })

        res.json({
            success: true,
            data: results
        })
    })

router.route('/state/:name')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<StateMatches>) {
        let name = req.params.name.replace('_', ' ')
        const matches = await prisma.match.findMany({
            where: {
                state: {
                    name: name
                }
            },
            include: {
                region: true,
                state: true,
                teamPerformances: {
                    include: {
                        team: true
                    },
                    orderBy: {
                        rank: 'asc'
                    }
                }
            }
        })

        const results: StateMatches = matches.map(r => ({
            id: r.id,
            year: r.year,
            round: r.round,
            region: r.region?.name,
            first: r.teamPerformances[0].team.name,
            firstScore: r.teamPerformances[0].overall,
            second: r.teamPerformances[1].team.name,
            secondScore: r.teamPerformances[1].overall,
            third: r.teamPerformances.length > 2 ? r.teamPerformances[2].team.name : null,
            thirdScore: r.teamPerformances.length > 2 ? r.teamPerformances[2].overall : null
        }))
        res.json({
            success: true,
            data: results
        })
    })

router.route('/school/:id/season/:year')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<SchoolSeasonPage>) {
        const id = parseInt(req.params.id)
        const year = parseInt(req.params.year)

        if (!id || !year) {
            res.json({ success: false })
            return
        }

        const school = await prisma.school.findFirst({
            where: {
                id: id
            }
        })

        if (!school) {
            res.json({ success: false, message: 'School not found' })
            return
        }

        const teamPerformances = await prisma.teamPerformance.findMany({
            where: {
                team: {
                    schoolId: id
                },
                match: {
                    year: year
                }
            },
            include: {
                match: true,
                team: {
                    include: {
                        school: true
                    }
                }
            }
        })

        const teamPerformancesByRound: { [round: string]: Array<Prisma.TeamPerformanceGetPayload<{ include: { match: true, team: { include: { school: true } } } }>> } = {}
        const matchByRound: { [round: string]: Prisma.MatchGetPayload<{}> } = {}
        for (const perf of teamPerformances) {
            if (perf.match.round in teamPerformancesByRound) {
                teamPerformancesByRound[perf.match.round].push(perf)
            } else {
                teamPerformancesByRound[perf.match.round] = [perf]
            }
            matchByRound[perf.match.round] = perf.match
        }

        let studentPerformancesByRound: { [round: string]: StudentPerformance[] } = {}
        let aggregatesByRound: { [round: string]: StudentAggregates } = {}
        for (const round of Object.keys(matchByRound)) {
            const match = matchByRound[round]
            const redacted = !req.access || req.access < match.access
            if (redacted) {
                studentPerformancesByRound[round] = await prisma.studentPerformance.findMany({
                    where: {
                        match: {
                            id: match.id
                        },
                        team: {
                            schoolId: id
                        }
                    },
                    select: {
                        student: true,
                        studentId: true,
                        id: true,
                        team: true,
                        teamId: true,
                        gpa: true,
                        overall: true,
                        matchId: true,
                        match: true
                    }
                })
                matchByRound[round].events = []
            } else {
                studentPerformancesByRound[round] = await prisma.studentPerformance.findMany({
                    where: {
                        match: {
                            id: match.id
                        },
                        team: {
                            schoolId: id
                        }
                    },
                    include: {
                        student: true,
                        team: true,
                        match: true
                    }
                })
            }
            if (!redacted) {
                let aggs: StudentAggregates = {}
                let cols: string[] = [...match.events]
                cols.push('objs', 'subs', 'overall')
                for (const c of cols) {
                    const c_ovr = (c == 'socialScience') ? 'social_science' : c
                    const query = `
                        SELECT team_id, sum(${c_ovr}) as combinedscore
                            FROM (
                                SELECT team_id, ${c_ovr}, ROW_NUMBER() OVER (
                                    PARTITION BY team_id, gpa ORDER BY ${c_ovr} DESC NULLS LAST
                                ) AS rank FROM student_performances JOIN teams t ON t.id = student_performances.team_id WHERE match_id = ${match.id} AND t.school_id = ${id}) ranked 
                        WHERE rank <= 2
                        GROUP BY team_id;    
                    `

                    const result: { team_id: number, combinedscore: number }[] = await prisma.$queryRawUnsafe(query)
                    result.forEach(entry => {
                        if (entry.team_id in aggs) {
                            aggs[entry.team_id][c] = entry.combinedscore
                        } else {
                            aggs[entry.team_id] = { [c]: entry.combinedscore }
                        }
                    })
                }
                aggregatesByRound[round] = aggs
            }
        }
        res.json({
            success: true,
            data: {
                school: school, ...['roundone', 'regionals', 'state', 'nationals'].reduce((prev, curr) => {
                    if (matchByRound[curr]) {
                        return {
                            ...prev, [curr]: {
                                studentPerformances: studentPerformancesByRound[curr],
                                teamPerformances: teamPerformancesByRound[curr],
                                match: matchByRound[curr],
                                aggregates: aggregatesByRound[curr]
                            }
                        }
                    } else {
                        return prev
                    }
                }, {})
            }
        })
    })

router.route('/potentialmerges/:state')
    .get(async function (req: AddbRequest<null>, res: AddbResponse<MergeSuggestion[]>) {
        if (!req.auth || !req.canEdit) {
            res.json({
                success: false,
                message: 'Not authorized'
            })
            return
        }

        const state = req.params.state
        const students = await prisma.student.findMany({
            where: {
                performances: {
                    some: {
                        team: {
                            school: {
                                state: {
                                    name: state
                                }
                            }
                        }
                    }
                }
            },
            include: {
                performances: {
                    where: {
                        team: {
                            school: {
                                state: {
                                    name: state
                                }
                            }
                        }
                    },
                    include: {
                        team: true
                    }
                }
            }
        })

        let teamToStudents: { [team: string]: Prisma.StudentGetPayload<{ include: { performances: { include: { team: true } } } }>[] } = {}
        for (const student of students) {
            const teamName = student.performances[0].team.name
            if (teamName in teamToStudents) {
                teamToStudents[teamName].push(student)
            } else {
                teamToStudents[teamName] = [student]
            }
        }

        const suggestions = Object.keys(teamToStudents).flatMap(teamName => {
            let potentialMerges: MergeSuggestion[] = []
            for (let i = 0; i < teamToStudents[teamName].length; i++) {
                for (let j = i + 1; j < teamToStudents[teamName].length; j++) {
                    let name1Spl = new Set(teamToStudents[teamName][i].name.split(' '))
                    let name2Spl = new Set(teamToStudents[teamName][j].name.split(' '))
                    let intersection = new Set([...name1Spl].filter(x => name2Spl.has(x)))
                    if (intersection.size > 0 || levenshtein(teamToStudents[teamName][i].name, teamToStudents[teamName][j].name) < 4) {
                        potentialMerges.push({
                            teamName: teamName,
                            student1: teamToStudents[teamName][i],
                            student2: teamToStudents[teamName][j]
                        })
                    }
                }
            }
            return potentialMerges
        })

        res.json({ success: true, data: suggestions })
    })


app.use('/api', router)
app.get('*', function (_, res) {
    res.sendFile(path.join(__dirname, 'dist', 'client', 'index.html'))
})

app.listen(port, function () {
    console.log(`api running on port ${port}`)
})