import api from "@/client/API"
import Table, { Column } from "@/client/components/table/Table"
import { FullStudentPerformance, SchoolSeasonPage, SchoolSeasonRound, StudentPerformance } from "@/shared/types/response"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, roundSort } from "@/shared/util/functions"
import { friendlyColumn, friendlyRound } from "@/shared/util/consts"
import StudentPerformanceRow from "@/client/components/table/StudentPerformanceRow"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import TeamPerformanceRow from "@/client/components/table/TeamPerformanceRow"
import StudentAggregateRow from "@/client/components/table/StudentAggregateRow"
import { Prisma } from "@prisma/client"

type StudentPerformanceColumn = {
    name: string,
    sortKey: (val: StudentPerformance) => number | string
}

type MatchConfig = {
    teamIdToNumber: { [id: number]: number },
    studentColumns: Column[],
    studentRows: JSX.Element[]
    teamColumns: Column[],
    teamRows: JSX.Element[],
    match: Prisma.MatchGetPayload<{}>
}

export default function SeasonResult() {

    const [result, setResult] = useState<SchoolSeasonPage | null | undefined>()
    const [sortIndex, setSortIndex] = useState(1)
    const [gpaFilter, setGpaFilter] = useState('all')
    const [sortDesc, setSortDesc] = useState(false)

    const params = useParams()
    const year = params.year

    const fetchData = useCallback(async () => {
        const result = (await api.getSeason(parseInt(params.id || '-1') || -1, parseInt(year || '-1') || -1)).data
        console.log(result)
        setResult(result)
    }, [])

    const setSort = useCallback((index: number) => {
        let i = index
        if (sortIndex > 3) {
            i -= 1
        }
        if (i == sortIndex) {
            setSortDesc(!sortDesc)
        } else {
            setSortIndex(i)
            setSortDesc(i > 3)
        }
    }, [sortIndex, sortDesc])

    useEffect(() => {
        fetchData()
    }, [params.id])

    if (!result) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    let roundToMatchConfig: { [round: string]: MatchConfig } = {}
    for (const round of ['roundone', 'regionals', 'state', 'nationals']) {
        if (round in result) {
            const roundResult = result[round as keyof SchoolSeasonPage] as SchoolSeasonRound
            const match = roundResult.match
            roundToMatchConfig[round] = {
                teamIdToNumber: {},
                studentColumns: [],
                studentRows: [],
                teamColumns: [],
                teamRows: [],
                match: match
            }
            const studentPerformances = roundResult.studentPerformances
            const teamPerformances = roundResult.teamPerformances
            const aggregates = roundResult.aggregates
            const teamIdToNumber: { [id: number]: number } =
                roundResult.teamPerformances.reduce((prev, curr) => {
                    return { ...prev, [curr.teamId || -1]: curr.number || -1 }
                }, {})

            roundToMatchConfig[round].teamIdToNumber = teamIdToNumber

            const teams = teamPerformances.map(perf => ({
                name: perf.team?.name || '',
                id: perf.teamId || -1
            })) || []


            const studentColumnDefs: StudentPerformanceColumn[] = [
                {
                    name: 'Team',
                    sortKey: a => a.team.name
                },
                {
                    name: '#',
                    sortKey: a => roundToMatchConfig[round].teamIdToNumber[a.teamId]
                },
                {
                    name: 'Decathlete',
                    sortKey: a => a.student?.name || ''
                },
                {
                    name: 'GPA',
                    sortKey: a => a.gpa
                },
                {
                    name: 'Overall',
                    sortKey: a => a.overall || 0
                }
            ]
            console.log(match)
            match.events.forEach(event => {
                studentColumnDefs.push({
                    name: friendlyColumn[event],
                    sortKey: (a: StudentPerformance) => (a as FullStudentPerformance)[event] || 0
                })
            })

            _hasObjs(match.events) && studentColumnDefs.push({
                name: 'Obj',
                sortKey: a => (a as FullStudentPerformance).objs || 0
            })
            _hasSubs(match.events) && studentColumnDefs.push({
                name: 'Sub',
                sortKey: a => (a as FullStudentPerformance).subs || 0
            })

            const studentColumns: Column[] = studentColumnDefs.map(def => ({ name: def.name, sortingAllowed: true }))
            if (sortIndex > 3) studentColumns.unshift({ name: 'Rank', sortingAllowed: false })

            roundToMatchConfig[round].studentColumns = studentColumns

            const sortedStudentPerformances = [...studentPerformances.filter(p => (gpaFilter == 'all' || p.gpa == gpaFilter))]
            const sortKey = studentColumnDefs[sortIndex].sortKey
            sortedStudentPerformances.sort((a, b) => {
                const valA = sortKey(a)
                const valB = sortKey(b)

                // Handle both numbers and strings
                let cmp
                if (typeof valA === "number" && typeof valB === "number") {
                    cmp = (valA - valB) || (a.gpa.localeCompare(b.gpa, undefined, { numeric: true }) * (sortDesc ? -1 : 1))
                } else {
                    cmp = String(valA).localeCompare(String(valB), undefined, { numeric: true }) || (a.gpa.localeCompare(b.gpa, undefined, { numeric: true }) * (sortDesc ? -1 : 1))
                }
                sortDesc && (cmp *= -1)
                return cmp
            })

            const getStudentPerformanceRows = (performances: StudentPerformance[]): JSX.Element[] => {
                const topRanks: { [performanceId: number]: { [category: string]: number } } = {}
                if (sortIndex < 2 && aggregates && gpaFilter == 'all') {
                    let rows = []
                    const studentPerformancesByTeam = Object.groupBy(performances, perf => sortKey(perf))
                    const sortedKeys = Object.keys(studentPerformancesByTeam).sort((a, b) => {
                        let cmp = String(a).localeCompare(String(b), undefined, { numeric: true })
                        sortDesc && (cmp *= -1)
                        return cmp
                    })
                    for (const key of sortedKeys) {
                        studentPerformancesByTeam[key]?.forEach((performance) => {
                            rows.push(<StudentPerformanceRow data={performance} teams={teams} ranks={topRanks[performance.id] || {}} teamNumber={teamIdToNumber[performance.team.id]} editingEnabled={false} events={match.events} key={performance.id} />)
                        })
                        const teamId = (studentPerformancesByTeam[key] && studentPerformancesByTeam[key][0].teamId) || 0
                        rows.push(<StudentAggregateRow key={teamId} data={aggregates[teamId]} events={match.events} />)
                    }
                    return rows
                } else {
                    return performances.map((performance, index) => {
                        return <StudentPerformanceRow key={performance.id} teams={teams} ranks={topRanks[performance.id] || {}} data={performance} teamNumber={teamIdToNumber[performance.team.id]} editingEnabled={false} events={match.events} index={sortIndex > 3 ? index : undefined} />
                    })
                }
            }

            roundToMatchConfig[round].studentRows = getStudentPerformanceRows(sortedStudentPerformances)

            const teamColumnNames = ['Rank', 'Team', 'Overall', 'Obj', 'Sub']
            match.hasSq && teamColumnNames.push('Overall + SQ')

            const teamColumns: Column[] = teamColumnNames.map(name => ({ name, sortingAllowed: false }))
            roundToMatchConfig[round].teamColumns = teamColumns

            const teamPerformanceRows = teamPerformances.map((performance) => {
                return <TeamPerformanceRow data={performance} rank={performance.rank} editingEnabled={false} events={match.events} hasSq={match.hasSq} key={performance.id} showMedals={false} />
            })
            roundToMatchConfig[round].teamRows = teamPerformanceRows
        }
    }

    return (
        <div className='info-page'>
            <Helmet>
                <title>{`${params.year} Season - ${result.school.fullName} | AcDecDB`}</title>
            </Helmet>
            <div className='small-header'>SEASON</div>
            <div className='info-page-header'>
                <div className='info-title'><Link to={`/school/${result.school.id}`}>{result.school.fullName}</Link></div>
                <div className='info-subtitle'>{year} Season</div>
                <div className="divisions-and-filters">
                    <div className="left-align-column">
                        <div className="title">Filter by GPA</div>
                        <select value={gpaFilter} onChange={e => setGpaFilter(e.target.value)}>
                            <option value='all'>All</option>
                            <option value='H'>H</option>
                            <option value='S'>S</option>
                            <option value='V'>V</option>
                        </select>
                    </div>
                </div>
            </div>
            {
                Object.keys(roundToMatchConfig).sort(roundSort).reverse().map(round => {
                    return (
                        <div className="info-page-section" key={round}>
                            <div className="info-page-section-header"><Link to={`/match/${roundToMatchConfig[round].match.id}`}>{friendlyRound[round]}</Link></div>
                            <h3 className="info-page-subhead">Individual Scores</h3>
                            <Table columns={roundToMatchConfig[round].studentColumns} sortIndex={sortIndex > 3 ? sortIndex + 1 : sortIndex} sortDesc={sortDesc} setSort={setSort}>
                                {roundToMatchConfig[round].studentRows}
                            </Table>
                            <h3 className="info-page-subhead">Team Scores</h3>
                            <Table columns={roundToMatchConfig[round].teamColumns}>
                                {roundToMatchConfig[round].teamRows}
                            </Table>
                        </div>
                    )
                })
            }
        </div >
    )
}