import { FullStudentPerformance, Match, StudentPerformance, TeamPerformance } from "@/shared/types/response"
import { groupBy, partitionSort, hasObjs as _hasObjs, hasSubs as _hasSubs, divisionSort } from "@/shared/util/functions"
import { useMemo, JSX } from "react"
import api from "../API"
import { divisions, friendlyColumn, friendlyGPA, fullColumn } from "@/shared/util/consts"
import StudentAggregateRow from "./table/StudentAggregateRow"
import StudentPerformanceRow from "./table/StudentPerformanceRow"
import TeamPerformanceRow from "./table/TeamPerformanceRow"
import { Tooltip } from "react-tooltip"
import Table, { Column } from "./table/Table"
import { ShowMedalsOptions } from "./MatchTablesControl"

type MatchTablesProps = {
    match: Match,
    editing?: boolean,
    sortIndex: number,
    sortDesc: boolean,
    gpaFilter: string,
    schoolFilter: number,
    divisionFilter: string,
    partitionBy: keyof ShowMedalsOptions,
    showMedals: boolean,
    rankBy: string,
    setSort: (index: number) => void,
    startLoading: () => void,
    refreshMatch: () => void
}

type StudentPerformanceColumn = {
    name: string,
    tip?: string,
    sortKey: (val: StudentPerformance) => number | string
}

// Returns a mapping from a student performance's ID to its rank, by the specified partitions
const calculateRanks = (performances: FullStudentPerformance[], sortKey: (perf: StudentPerformance) => string | number, byDivision: boolean, byGpa: boolean, teamIdToDivision: { [id: number]: string }): { [id: number]: number } => {
    let partitions: Array<FullStudentPerformance[] | undefined> = [performances]
    if (byDivision) {
        partitions = partitions.flatMap(partition => Object.values(groupBy(partition || [], perf => teamIdToDivision[perf.teamId])))
    }
    if (byGpa) {
        partitions = partitions.flatMap(partition => Object.values(groupBy(partition || [], perf => perf.gpa)))
    }

    const scorePartitions = partitions.map(partition => groupBy(partition || [], perf => parseFloat(sortKey(perf).toString()) || 0))
    const result: { [id: number]: number } = {}
    scorePartitions.forEach(partition => {
        Object.keys(partition).sort((a, b) => parseFloat(b) - parseFloat(a)).forEach((scoreStr, index) => {
            const score = parseFloat(scoreStr)
            partition[score] && partition[score].forEach(perf => {
                result[perf.id] = index
            })
        })
    })
    return result
}

export default function MatchTables({
    match,
    editing,
    sortIndex,
    sortDesc,
    gpaFilter,
    schoolFilter,
    divisionFilter,
    partitionBy,
    showMedals,
    rankBy,
    setSort,
    startLoading,
    refreshMatch
}: MatchTablesProps) {

    if (!match) return (null)

    const uploadTeamCSV = async () => {
        let formData = new FormData()
        const input = document.getElementById('team-data-upload') as HTMLInputElement
        startLoading()
        if (!match || !input.files || input.files.length < 1) return
        formData.append('teamData', input.files[0])
        const result = await api.uploadTeamPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        }
        refreshMatch()
    }

    const uploadStudentCSV = async () => {
        let formData = new FormData()
        const input = document.getElementById('student-data-upload') as HTMLInputElement
        startLoading()
        if (!match || !input.files || input.files.length < 1) return
        formData.append('studentData', input.files[0])
        const result = await api.uploadStudentPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        }
        refreshMatch()
    }

    const canEdit = useMemo(() => api.canEdit(), [])
    const privateAccess = useMemo(() => api.hasPrivateAccess(), [])
    const individualsHidden = !privateAccess && match?.access == 3

    const hasObjs = useMemo((): boolean => {
        return _hasObjs(match?.events, match?.year)
    }, [match?.events])

    const hasSubs = useMemo((): boolean => {
        return _hasSubs(match?.events)
    }, [match?.events])

    const teams = match?.teamPerformances.map(perf => ({
        name: perf.team?.name || '',
        id: perf.teamId || -1
    })) || []

    const teamIdToRank: { [id: number]: number } = useMemo(() => {
        return match ? match.teamPerformances.reduce((prev, curr) => {
            return { ...prev, [curr.teamId || -1]: curr.rank || -1 }
        }, {}) : {}
    }, [match?.teamPerformances])

    const teamIdToDivision: { [id: number]: string } = useMemo(() => {
        return match ? match.teamPerformances.reduce((prev, curr) => {
            return { ...prev, [curr.teamId || 'null']: curr.division || 'null' }
        }, {}) : {}
    }, [match?.teamPerformances])

    const teamsByDivision: Partial<Record<string, TeamPerformance[]>> = (() => {
        if (!match) return {}
        if (partitionBy == 'division' || partitionBy == 'gpa_division') return groupBy(match.teamPerformances, perf => (perf.division || 'null'))
        return { all: match.teamPerformances }
    })()

    const studentColumnDefs: StudentPerformanceColumn[] = [
        {
            name: 'Team',
            sortKey: a => a.team.name
        },
        {
            name: 'TmRk',
            sortKey: a => teamIdToRank[a.teamId],
            tip: "Team Rank"
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

    if (match && match.events.length > 0 && match.events.length < 10) {
        studentColumnDefs.push({
            name: 'Overall/10',
            sortKey: a => a.overall || 0,
            tip: "Extrapolated 10-event score, since this match had fewer events"
        })
    }

    match?.events.forEach(event => {
        studentColumnDefs.push({
            name: friendlyColumn[event],
            sortKey: (a: StudentPerformance) => (a as FullStudentPerformance)[event] || 0,
            tip: fullColumn[event]
        })
    })

    hasObjs && studentColumnDefs.push({
        name: 'Obj',
        tip: 'Objectives (total of all non-judged events)',
        sortKey: a => (a as FullStudentPerformance).objs || 0
    })

    hasSubs && studentColumnDefs.push({
        name: 'Sub',
        tip: 'Subjectives (total of all judged events)',
        sortKey: a => (a as FullStudentPerformance).subs || 0
    })

    const ranksByCol: { [index: number]: { [id: number]: number } } = studentColumnDefs.reduce((prev, col, index) => {
        if (index < 4) return prev
        return {
            ...prev, [index]: calculateRanks(match.studentPerformances as FullStudentPerformance[],
                col.sortKey, rankBy == 'division' || rankBy == 'gpa_division', rankBy == 'gpa' || rankBy == 'gpa_division', teamIdToDivision)
        }
    }, {})

    const ranksByPerfId = Object.entries(ranksByCol).reduce((prev: { [id: number]: { [index: number]: number } }, [event, ranksByPerf]) => {
        Object.entries(ranksByPerf).forEach(([perf, rank]) => {
            if (!prev[parseInt(perf)]) prev[parseInt(perf)] = {} // Initialize if doesn't exist
            prev[parseInt(perf)][parseInt(event)] = rank // Swap mapping
        })
        return prev
    }, {})

    const filteredStudentPerformances = [...match?.studentPerformances].filter(perf => {
        return (divisionFilter == 'all' || teamIdToDivision[perf.teamId] == divisionFilter)
            && (gpaFilter == 'all' || perf.gpa == gpaFilter)
            && (schoolFilter == -1 || perf.team.schoolId == schoolFilter)
    })

    const sortKey = studentColumnDefs[sortIndex].sortKey
    const sortedStudentPerformances = filteredStudentPerformances.sort((a, b) => {
        const valA = sortKey(a), valB = sortKey(b)
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

    const studentColumns: Column[] = studentColumnDefs.map(def => ({ name: def.name, tip: def.tip, sortingAllowed: true }))
    if (sortIndex > 3) studentColumns.unshift({ name: 'Rank', sortingAllowed: false })

    editing && studentColumns.push({ name: "Edit", sortingAllowed: false })

    const partitionKey = (perf: StudentPerformance) => {
        let partition = ''
        if (partitionBy == 'division' || partitionBy == 'gpa_division') {
            partition += `_d${teamIdToDivision[perf.teamId]}`
        }
        if (partitionBy == 'gpa' || partitionBy == 'gpa_division') {
            partition += `_g${perf.gpa}`
        }
        return partition
    }

    const friendlyPartition = (key: string): string => {
        const strippedKey = key.slice(1)
        if (partitionBy == 'division') {
            return divisions[strippedKey.slice(1)]
        } else if (partitionBy == 'gpa') {
            return friendlyGPA[strippedKey.slice(1)]
        } else if (partitionBy == 'gpa_division') {
            const splitKey = strippedKey.split('_')
            return `${divisions[splitKey[0].slice(1)]} - ${friendlyGPA[splitKey[1].slice(1)]}`
        }

        return ''
    }

    const hasAnyRegion = false // match.teamPerformances.filter(perf => perf.team.school?.regionId).length > 0
    let teamColumnNames = ['Rank', 'Team']
    if (match.round == 'nationals') teamColumnNames.push('State')
    if (match.round == 'state' && hasAnyRegion) teamColumnNames.push('Region')
    teamColumnNames.push('Overall')
    match.events.length > 0 && match.events.length < 10 && teamColumnNames.push('Overall/10')
    teamColumnNames.push('Obj', 'Sub')
    match.hasSq && teamColumnNames.push('Overall + SQ')
    editing && teamColumnNames.push('Division', 'Edit')

    const teamColumns: Column[] = teamColumnNames.map(name => ({ name, sortingAllowed: false }))

    const teamIdToPartitionRank: { [id: number]: number } = {}
    const teamPerformanceRowsByDivision: { [division: string]: JSX.Element[] } = Object.keys(teamsByDivision).reduce((prev, division) => {
        if (!teamsByDivision[division]) return { ...prev, [division]: [] }
        const sortedTeamPerformances = [...teamsByDivision[division].filter(perf => divisionFilter == 'all' || perf.division == divisionFilter).filter(perf => (schoolFilter == -1 || perf.team.schoolId == schoolFilter))]
        if (sortedTeamPerformances.length == 0) return prev
        sortedTeamPerformances.sort((a, b) => a.rank - b.rank)
        const teamPerformanceRows = sortedTeamPerformances.map((performance, index) => {
            const rank = schoolFilter == -1 ? index + 1 : performance.rank
            teamIdToPartitionRank[performance.teamId] = rank
            return <TeamPerformanceRow data={performance} rank={rank} editCallback={refreshMatch} editingEnabled={editing ?? false} events={match.events} hasSq={match.hasSq} key={performance.id} match={match} showMedals={showMedals} showRegion={hasAnyRegion} />
        })
        return { ...prev, [division]: teamPerformanceRows }
    }, {})

    const studentsByPartition: Partial<Record<string, StudentPerformance[]>> =
        groupBy(sortedStudentPerformances, perf => partitionKey(perf))

    const getStudentPerformanceRows = (performances: StudentPerformance[]): JSX.Element[] => {
        if (sortIndex < 2 && match.aggregates && gpaFilter == 'all' && partitionBy != 'gpa' && partitionBy != 'gpa_division') {
            let rows = []
            const studentPerformancesByTeam = groupBy(performances, perf => sortKey(perf))
            const sortedKeys = Object.keys(studentPerformancesByTeam).sort((a, b) => {
                let cmp = String(a).localeCompare(String(b), undefined, { numeric: true })
                sortDesc && (cmp *= -1)
                return cmp
            })
            for (const key of sortedKeys) {
                let addAggregate = false
                studentPerformancesByTeam[key]?.forEach((performance) => {
                    (schoolFilter == -1 || performance.team.schoolId == schoolFilter) && rows.push(<StudentPerformanceRow data={performance} teams={teams} rankByCol={ranksByPerfId[performance.id]} teamRank={teamIdToPartitionRank[performance.team.id]} editCallback={refreshMatch} editingEnabled={editing ?? false} events={match.events} key={performance.id} showMedals={showMedals} />) && (addAggregate = true)
                })
                const teamId = (studentPerformancesByTeam[key] && studentPerformancesByTeam[key][0].teamId) || 0
                addAggregate && rows.push(<StudentAggregateRow key={teamId} data={match.aggregates[teamId]} events={match.events} year={match.year} />)
            }
            return rows
        } else {
            return performances.reduce((prev: JSX.Element[], performance) => {
                return (schoolFilter == -1 || performance.team.schoolId == schoolFilter) ? [...prev, <StudentPerformanceRow key={performance.id} teams={teams} rankByCol={ranksByPerfId[performance.id]} data={performance} teamRank={teamIdToPartitionRank[performance.team.id]} editCallback={refreshMatch} editingEnabled={editing ?? false} events={match.events} rank={sortIndex > 3 ? ranksByPerfId[performance.id][sortIndex] : undefined} showMedals={showMedals} />] : prev
            }, [])
        }
    }

    const studentPerformanceRowsByPartition: { [partition: string]: JSX.Element[] } = Object.keys(studentsByPartition).reduce((prev, partition) => {
        if (!studentsByPartition[partition]) return { ...prev, [partition]: [] }
        return { ...prev, [partition]: getStudentPerformanceRows(studentsByPartition[partition]) }
    }, {})

    const hasStudentData = match.studentPerformances.length > 0
    const hasTeamData = match.teamPerformances.length > 0

    return (
        <div className="match-tables">
            {(!individualsHidden || canEdit) &&
                <div className="info-page-section">
                    {hasStudentData &&
                        <div className='info-page-section-header' style={{ display: 'flex', alignItems: 'center' }}>
                            {!privateAccess && match.access == 2 && 'Outstanding '}Individual Scores
                            {!privateAccess && match.access == 2 &&
                                <span data-tooltip-id='redacted-explainer' style={{ marginLeft: 5, fontSize: '13px' }}>
                                    <Tooltip id="redacted-explainer">Only outstanding scores are available for this data. Outstanding scores are considered to be above 7,000 for Honors, 6,500 for Scholastic, and 6,000 for Varsity.</Tooltip>
                                    (?)
                                </span>}
                        </div>}

                    {hasStudentData && Object.keys(studentPerformanceRowsByPartition).sort(partitionSort).filter(d => studentPerformanceRowsByPartition[d].length > 0).map(partition => {
                        return (
                            <div key={partition}>
                                {partitionBy != 'overall' && <h3 className="info-page-subhead">{friendlyPartition(partition)}</h3>}
                                <Table columns={studentColumns} sortIndex={sortIndex > 3 ? sortIndex + 1 : sortIndex} sortDesc={sortDesc} setSort={setSort}>
                                    {studentPerformanceRowsByPartition[partition]}
                                </Table>
                            </div>
                        )
                    })}

                    {(!individualsHidden || canEdit) && !hasStudentData && <>
                        <div>No student performances have been entered for this match.</div>
                        {canEdit && Object.keys(teamPerformanceRowsByDivision).length > 0 && (
                            <div style={{ marginTop: 10 }}>
                                <label>
                                    <b style={{ marginRight: 10 }}>Import Data</b>
                                    <input id='student-data-upload' type='file' accept='.csv' onChange={uploadStudentCSV} onClick={e => { (e.target as HTMLInputElement).value = '' }} />
                                </label>
                                <div style={{ marginTop: 5 }}><b>Required CSV Format:</b> Team Name | GPA | Student Name | {match.events.map(s => friendlyColumn[s]).join(' | ')}</div>
                            </div>
                        )}
                        {canEdit && Object.keys(teamPerformanceRowsByDivision).length == 0 && (
                            <div><i>Please upload team performances first.</i></div>
                        )}
                    </>}
                </div>
            }
            <div>
                {hasTeamData &&
                    <div className='info-page-section-header'>
                        Team Scores
                    </div>
                }
                {
                    hasTeamData && Object.keys(teamPerformanceRowsByDivision).sort(divisionSort).map(division => {
                        const rows = teamPerformanceRowsByDivision[division]
                        return (
                            <div key={division}>
                                {match.hasDivisions && <h3 className="info-page-subhead">{divisions[division]}</h3>}
                                <Table columns={teamColumns}>
                                    {rows}
                                </Table>
                            </div>
                        )
                    })
                }
                {
                    !hasTeamData && (
                        <>
                            <div>
                                No team performances have been entered for this match.
                            </div>
                            {canEdit && (
                                <div style={{ marginTop: 10 }}>
                                    <label>
                                        <b style={{ marginRight: 10 }}>Import Data</b>
                                        <input id='team-data-upload' type='file' accept='.csv' onChange={uploadTeamCSV} onClick={e => { (e.target as HTMLInputElement).value = '' }} />
                                    </label>
                                    <div style={{ marginTop: 5 }}><b>Required CSV Format:</b> Rank | Team Name | Overall | Objs | Subs {match.hasSq && '| Super Quiz'} {match.hasDivisions && '| Division'}</div>
                                </div>
                            )}
                        </>
                    )
                }
            </div>
        </div>
    )

}