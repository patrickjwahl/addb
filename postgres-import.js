import { PrismaClient } from '@prisma/client';
import fs from 'node:fs'
import { exit } from 'node:process'

const prisma = new PrismaClient()
let data
let rootdir = process.argv[2];

(async () => {

    let readLines = (fn) => {
        try {
            data = fs.readFileSync(rootdir + '/' + fn, 'utf8')
            return data.split('\n').filter(l => l).map(l => JSON.parse(l))
        } catch (err) {
            console.log(err);
            exit
        }
    }

    console.log("cleaning db");

    await prisma.edit.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.studentPerformance.deleteMany({})
    await prisma.teamPerformance.deleteMany({})
    await prisma.team.deleteMany({})
    await prisma.match.deleteMany({})
    await prisma.student.deleteMany({})
    await prisma.school.deleteMany({})
    await prisma.region.deleteMany({})
    await prisma.state.deleteMany({})


    // USERS

    console.log("importing users");

    const users = readLines('users.json').map(mu => ({
        username: mu.username,
        passhash: mu.passhash,
        access: mu.access,
        canEdit: mu.canEdit
    }))
    await prisma.user.createMany({ data: users })

    const unameToId = (await prisma.user.findMany()).reduce((prev, curr) => {
        return { ...prev, [curr.username]: curr.id }
    }, {})


    // EDITS 

    console.log('importing edits');

    const edits = readLines('edits.json').map(e => ({
        userId: unameToId[e.user],
        datetime: new Date(e.datetime.$date),
        summary: e.summary
    }))
    await prisma.edit.createMany({ data: edits })


    // SCHOOLS

    console.log('importing schools');

    const mongoSchools = readLines('schools.json')
    let stateNameToId = {}
    let regionToId = {}
    let schoolMidToId = {}
    for (const ms of mongoSchools) {
        let state = await prisma.state.findFirst({
            where: {
                name: ms.state
            }
        })
        if (!state) {
            state = await prisma.state.create({
                data: {
                    name: ms.state
                }
            })
        }
        stateNameToId[ms.state] = state.id
        const stateId = state.id

        let regionId = null
        if (ms.region) {
            let region = await prisma.region.findFirst({
                where: {
                    name: ms.region,
                    stateId: stateId
                }
            })
            if (!region) {
                region = await prisma.region.create({
                    data: {
                        name: ms.region,
                        stateId: stateId
                    }
                })
                regionToId[`${ms.state}-${ms.region}`] = region.id
            }
            regionId = region.id
        }


        const school = {
            name: ms.name,
            city: ms.city,
            regionId: regionId,
            stateId: stateId,
            district: ms.district,
            fullName: ms.fullName
        }
        const newSchool = await prisma.school.create({
            data: school
        })
        schoolMidToId[ms._id.$oid] = newSchool.id
    }


    // STUDENTS

    console.log('importing students');

    const mongoStudents = readLines('people.json')
    let studentMidToId = {}
    for (const ms of mongoStudents) {
        const student = {
            name: ms.name
        }
        const newStudent = await prisma.student.create({
            data: student
        })
        studentMidToId[ms._id.$oid] = newStudent.id
    }


    // MATCHES

    const eventOrdering = ['math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview']
    const mongoMatches = readLines('matches.json')
    for (const mm of mongoMatches) {

        if (!mm.date) {
            continue
        }

        let eventSchedule = Object.keys(mm.events).filter(key => (mm.events[key] == true && eventOrdering.indexOf(key) >= 0))
        eventSchedule.sort((a, b) => { return eventOrdering.indexOf(a) - eventOrdering.indexOf(b) })

        let match = {
            search1: mm.search1,
            search2: mm.search2,
            search3: mm.search3,
            year: parseInt(mm.year),
            round: mm.round,
            date: new Date(mm.date.$date),
            site: mm.site,
            hasSq: mm.hasSq,
            incompleteData: mm.incompleteData,
            hasDivisions: mm.hasDivisions,
            access: mm.access,
            events: eventSchedule
        }

        if (mm.round != 'nationals') {
            match['stateId'] = stateNameToId[mm.state]
            if (mm.round != 'state') {
                match['regionId'] = regionToId[`${mm.state}-${mm.region}`]
            }
        }

        const newMatch = await prisma.match.create({
            data: match
        })
        const matchId = newMatch.id

        let teamNameToNumber = {}
        let teamNameToId = {}
        for (const studentRow of mm.students) {
            const num = parseInt(studentRow.team)
            if (num) {
                teamNameToNumber[studentRow.teamName] = num
            }
        }

        for (const mt of mm.teams) {
            const schoolId = schoolMidToId[mt.id]
            let team = await prisma.team.findFirst({
                where: {
                    schoolId: schoolId,
                    name: mt.teamName
                }
            })
            if (!team) {
                team = await prisma.team.create({
                    data: {
                        name: mt.teamName,
                        schoolId: schoolId
                    }
                })
            }
            const teamId = team.id
            teamNameToId[mt.teamName] = teamId

            const teamNumber = teamNameToNumber[mt.teamName]
            const teamPerformance = {
                matchId: matchId,
                teamId: teamId,
                number: teamNumber,
                rank: mt.rank,
                overall: parseFloat(mt.overall?.replace(',', '')),
                objs: parseFloat(mt.objs?.replace(',', '')),
                subs: parseFloat(mt.subs?.replace(',', '')),
                division: mt.division,
                sq: parseFloat(mt.sq?.replace(',', ''))
            }

            await prisma.teamPerformance.create({ data: teamPerformance })
        }

        for (const ms of mm.students) {

            const studentPerformance = {
                studentId: studentMidToId[ms.id],
                matchId: matchId,
                teamId: teamNameToId[ms.teamName],
                gpa: ms.gpa,
                math: parseFloat(ms.math?.replace(',', '')),
                music: parseFloat(ms.music?.replace(',', '')),
                econ: parseFloat(ms.econ?.replace(',', '')),
                science: parseFloat(ms.science?.replace(',', '')),
                lit: parseFloat(ms.lit?.replace(',', '')),
                art: parseFloat(ms.art?.replace(',', '')),
                socialScience: parseFloat(ms.socialScience?.replace(',', '')),
                essay: parseFloat(ms.essay?.replace(',', '')),
                speech: parseFloat(ms.speech?.replace(',', '')),
                interview: parseFloat(ms.interview?.replace(',', '')),
                overall: parseFloat(ms.overall?.replace(',', '')),
                objs: parseFloat(ms.objs?.replace(',', '')),
                subs: parseFloat(ms.subs?.replace(',', ''))
            }

            await prisma.studentPerformance.create({ data: studentPerformance })
        }
    }
})()