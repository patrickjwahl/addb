import api from "@/client/API"
import Table, { Column } from "@/client/components/table/Table"
import { FullStudentPerformance, Match, StudentPerformance, TeamPerformance } from "@/shared/types/response"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams, useSearchParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, divisionSort } from "@/shared/util/functions"
import { divisions, friendlyColumn, friendlyRound } from "@/shared/util/consts"
import StudentPerformanceRow from "@/client/components/table/StudentPerformanceRow"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import TeamPerformanceRow from "@/client/components/table/TeamPerformanceRow"
import StudentAggregateRow from "@/client/components/table/StudentAggregateRow"
import MatchPropertiesEdit from "@/client/components/edit/MatchPropertiesEdit"

type StudentPerformanceColumn = {
    name: string,
    sortKey: (val: StudentPerformance) => number | string
}

export default function MatchResult2() {

    const [searchParams] = useSearchParams()
    const schoolInitFilter = searchParams.get('school')

    const [match, setMatch] = useState<Match>()
    const [editing, setEditing] = useState(false)
    const [showDivisions, setShowDivisions] = useState(true)
    const [sortIndex, setSortIndex] = useState(1)
    const [sortDesc, setSortDesc] = useState(false)
    const [isDeleted, setIsDeleted] = useState(false)
    const [gpaFilter, setGpaFilter] = useState('all')
    const [schoolFilter, setSchoolFilter] = useState(parseInt(schoolInitFilter || '') || -1)
    const [showMedals, setShowMedals] = useState(true)

    const params = useParams()

    const fetchMatch = useCallback(async () => {
        const result = (await api.getMatch(params.id || '')).data
        setMatch(result)
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
        fetchMatch()
    }, [params.id])

    const toggleEditMode = () => {
        setEditing(!editing)
    }

    const deleteMatch = async () => {
        if (match && window.confirm("Are you very sure?")) {
            const result = await api.deleteMatch(match.id)
            if (!result.success) {
                alert(result.message)
            } else {
                setIsDeleted(true)
            }
        }
    }

    const uploadTeamCSV = async () => {
        let formData = new FormData()
        const input = document.getElementById('team-data-upload') as HTMLInputElement
        if (!match || !input.files || input.files.length < 1) return
        formData.append('teamData', input.files[0])
        const result = await api.uploadTeamPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        } else {
            fetchMatch()
        }
    }

    const uploadStudentCSV = async () => {
        let formData = new FormData()
        const input = document.getElementById('student-data-upload') as HTMLInputElement
        if (!match || !input.files || input.files.length < 1) return
        formData.append('studentData', input.files[0])
        const result = await api.uploadStudentPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        } else {
            fetchMatch()
        }
    }

    const teams = match?.teamPerformances.map(perf => ({
        name: perf.team?.name || '',
        id: perf.teamId || -1
    })) || []

    const userHasAccess = !!match && match?.events.length > 0
    const canEdit = useMemo(() => api.canEdit(), [])

    const hasObjs = useMemo((): boolean => {
        return _hasObjs(match?.events)
    }, [match?.events])

    const hasSubs = useMemo((): boolean => {
        return _hasSubs(match?.events)
    }, [match?.events])

    const teamIdToNumber: { [id: number]: number } = useMemo(() => {
        return match ? match.teamPerformances.reduce((prev, curr) => {
            return { ...prev, [curr.teamId || -1]: curr.number || -1 }
        }, {}) : {}
    }, [match?.teamPerformances])

    const teamIdToDivision: { [id: number]: string } = useMemo(() => {
        return match ? match.teamPerformances.reduce((prev, curr) => {
            return { ...prev, [curr.teamId || 'null']: curr.division || 'null' }
        }, {}) : {}
    }, [match?.teamPerformances])

    const schoolNameToId: { [name: string]: number } = useMemo(() => {
        return match ? match.teamPerformances.reduce((prev, perf) => {
            if (perf.team.school) return {
                ...prev, [perf.team.school.fullName || perf.team.school.name]: perf.team.schoolId
            }
            return prev
        }, {}) : {}
    }, [match])

    const teamsByDivision: Partial<Record<string, TeamPerformance[]>> = (() => {
        if (!match) return {}
        if (showDivisions) return Object.groupBy(match.teamPerformances, perf => (perf.division || 'null'))
        return { all: match.teamPerformances }
    })()

    if (!match) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    const studentColumnDefs: StudentPerformanceColumn[] = [
        {
            name: 'Team',
            sortKey: a => a.team.name
        },
        {
            name: '#',
            sortKey: a => teamIdToNumber[a.teamId]
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

    match.events.forEach(event => {
        studentColumnDefs.push({
            name: friendlyColumn[event],
            sortKey: (a: StudentPerformance) => (a as FullStudentPerformance)[event] || 0
        })
    })

    hasObjs && studentColumnDefs.push({
        name: 'Obj',
        sortKey: a => (a as FullStudentPerformance).objs || 0
    })
    hasSubs && studentColumnDefs.push({
        name: 'Sub',
        sortKey: a => (a as FullStudentPerformance).subs || 0
    })

    const studentColumns: Column[] = studentColumnDefs.map(def => ({ name: def.name, sortingAllowed: true }))
    if (sortIndex > 3) studentColumns.unshift({ name: 'Rank', sortingAllowed: false })

    editing && studentColumns.push({ name: "Edit", sortingAllowed: false })

    const sortedStudentPerformances = [...match.studentPerformances.filter(p => (gpaFilter == 'all' || p.gpa == gpaFilter) && (schoolFilter == -1 || p.team.schoolId == schoolFilter))]
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

    const studentsByDivision: Partial<Record<string, StudentPerformance[]>> = (() => {
        if (!match) return {}
        if (showDivisions) return Object.groupBy(sortedStudentPerformances, perf => teamIdToDivision[perf.teamId])
        return { all: sortedStudentPerformances }
    })()

    const getStudentPerformanceRows = (performances: StudentPerformance[]): JSX.Element[] => {
        const topRanks: { [performanceId: number]: { [category: string]: number } } = {}
        if (showMedals) {
            for (const event of (match.events as Array<keyof FullStudentPerformance>).concat(['overall', 'subs', 'objs'])) {
                const medalGroups = Object.groupBy(performances, perf => (perf as FullStudentPerformance)[event] as number || 0)
                if (!medalGroups) continue
                const sortedKeys = Object.keys(medalGroups).map(Number).sort((a, b) => b - a)
                for (let i = 0; i < Math.min(3, sortedKeys.length); i++) {
                    const group = medalGroups[sortedKeys[i]]
                    if (group) {
                        for (const perf of group) {
                            if (perf.id in topRanks) {
                                topRanks[perf.id][event] = i + 1
                            } else {
                                topRanks[perf.id] = { [event]: i + 1 }
                            }
                        }
                    }
                }
            }
        }
        if (sortIndex < 2 && match.aggregates && gpaFilter == 'all') {
            let rows = []
            const studentPerformancesByTeam = Object.groupBy(performances, perf => sortKey(perf))
            const sortedKeys = Object.keys(studentPerformancesByTeam).sort((a, b) => {
                let cmp = String(a).localeCompare(String(b), undefined, { numeric: true })
                sortDesc && (cmp *= -1)
                return cmp
            })
            for (const key of sortedKeys) {
                studentPerformancesByTeam[key]?.forEach((performance) => {
                    rows.push(<StudentPerformanceRow data={performance} teams={teams} ranks={topRanks[performance.id] || {}} teamNumber={teamIdToNumber[performance.team.id]} editingEnabled={editing} events={match.events} key={performance.id} />)
                })
                const teamId = (studentPerformancesByTeam[key] && studentPerformancesByTeam[key][0].teamId) || 0
                rows.push(<StudentAggregateRow key={teamId} data={match.aggregates[teamId]} events={match.events} />)
            }
            return rows
        } else {
            return performances.map((performance, index) => {
                return <StudentPerformanceRow key={performance.id} teams={teams} ranks={topRanks[performance.id] || {}} data={performance} teamNumber={teamIdToNumber[performance.team.id]} editingEnabled={editing} events={match.events} index={sortIndex > 3 ? index : undefined} />
            })
        }
    }

    const studentPerformanceRowsByDivision: { [division: string]: JSX.Element[] } = Object.keys(studentsByDivision).reduce((prev, division) => {
        if (!studentsByDivision[division]) return { ...prev, [division]: [] }
        return { ...prev, [division]: getStudentPerformanceRows(studentsByDivision[division]) }
    }, {})

    const teamColumnNames = ['Rank', 'Team', 'Overall', 'Obj', 'Sub']
    match.hasSq && teamColumnNames.push('Overall + SQ')
    editing && teamColumnNames.push('Division', 'Edit')

    const teamColumns: Column[] = teamColumnNames.map(name => ({ name, sortingAllowed: false }))

    const teamPerformanceRowsByDivision: { [division: string]: JSX.Element[] } = Object.keys(teamsByDivision).reduce((prev, division) => {
        if (!teamsByDivision[division]) return { ...prev, [division]: [] }
        const sortedTeamPerformances = [...teamsByDivision[division].filter(perf => (schoolFilter == -1 || perf.team.schoolId == schoolFilter))]
        if (sortedTeamPerformances.length == 0) return prev
        sortedTeamPerformances.sort((a, b) => a.rank - b.rank)
        const teamPerformanceRows = sortedTeamPerformances.map((performance, index) => {
            return <TeamPerformanceRow data={performance} rank={schoolFilter == -1 ? index + 1 : performance.rank} editingEnabled={editing} events={match.events} hasSq={match.hasSq} key={performance.id} match={match} showMedals={showMedals} />
        })
        return { ...prev, [division]: teamPerformanceRows }
    }, {})

    let subtitle = ''
    if (match.state) {
        subtitle = match.state?.name
    }
    if (match.region) {
        subtitle += `, ${match.region.name}`
    }

    let thirdTitle
    if (match.date && match.site) {
        thirdTitle = `${new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} - ${match.site}`
    } else if (match.date) {
        thirdTitle = new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    } else if (match.site) {
        thirdTitle = match.site
    } else {
        thirdTitle = ''
    }

    if (isDeleted) return <img src="/img/chigurh.jpg" />

    const hasStudentData = match.studentPerformances.length > 0
    const hasTeamData = match.teamPerformances.length > 0

    return (
        <div className='info-page'>
            <Helmet>
                <title>{`${match.year} ${friendlyRound[match.round]} - ${subtitle} | AcDecDB`}</title>
            </Helmet>
            <div className='small-header'>MATCH</div>
            <div className='info-page-header'>
                {editing ? <MatchPropertiesEdit match={match} callback={fetchMatch} /> : (
                    <>
                        <div className='info-title'>{match.year} {friendlyRound[match.round]}</div>
                        <div className='info-subtitle'>{subtitle}</div>
                        <div className='info-third-title'>{thirdTitle}</div>
                    </>
                )}
                {userHasAccess && canEdit &&
                    <div className='header-edit-buttons'>
                        <button className="admin-button" onClick={toggleEditMode}>{editing ? 'Leave Editing Mode' : 'Edit'}</button>
                        <button className="admin-button" onClick={deleteMatch}>Delete</button>
                    </div>
                }
                <div className="divisions-and-filters">
                    {match.hasDivisions &&

                        <div className="left-align-column">
                            <div className="title">{showDivisions ? 'Results by Division' : 'Overall Results'}</div>
                            <button className="divisions-button" onClick={() => setShowDivisions(!showDivisions)}>
                                {!showDivisions ? 'Show by Division' : 'Show Overall'}
                            </button>
                        </div>
                    }
                    <div className="left-align-column">
                        <div className="title">Filter by GPA</div>
                        <select value={gpaFilter} onChange={e => setGpaFilter(e.target.value)}>
                            <option value='all'>All</option>
                            <option value='H'>H</option>
                            <option value='S'>S</option>
                            <option value='V'>V</option>
                        </select>
                    </div>
                    <div className="left-align-column">
                        <div className="title">Filter by School</div>
                        <select value={schoolFilter} onChange={e => setSchoolFilter(parseInt(e.target.value))}>
                            <option value={-1}>All</option>
                            {Object.keys(schoolNameToId).sort().map(name => {
                                return <option key={name} value={schoolNameToId[name]}>{name}</option>
                            })}
                        </select>
                    </div>
                    <div className="left-align-column">
                        <div className="title" onClick={() => setShowMedals(!showMedals)}>Show Medals</div>
                        <input type="checkbox" checked={showMedals} onChange={() => setShowMedals(!showMedals)} />
                    </div>
                </div>
            </div>
            <div className="info-page-section">
                {hasStudentData &&
                    <div className='info-page-section-header'>Individual Scores</div>}

                {hasStudentData && Object.keys(studentPerformanceRowsByDivision).sort(divisionSort).map(division => {
                    return (
                        <div key={division}>
                            {match.hasDivisions && <h3 className="info-page-subhead">{divisions[division]}</h3>}
                            <Table columns={studentColumns} sortIndex={sortIndex > 3 ? sortIndex + 1 : sortIndex} sortDesc={sortDesc} setSort={setSort}>
                                {studentPerformanceRowsByDivision[division]}
                            </Table>
                        </div>
                    )
                })}

                {!hasStudentData && <>
                    <div>No student performances have been entered for this match.</div>
                    {userHasAccess && canEdit && Object.keys(teamPerformanceRowsByDivision).length > 0 && (
                        <div style={{ marginTop: 10 }}>
                            <label>
                                <b style={{ marginRight: 10 }}>Import Data</b>
                                <input id='student-data-upload' type='file' accept='.csv' onChange={uploadStudentCSV} onClick={e => { (e.target as HTMLInputElement).value = '' }} />
                            </label>
                            <div style={{ marginTop: 5 }}><b>Required CSV Format:</b> Team Name | Team Number | GPA | Student Name | {match.events.map(s => friendlyColumn[s]).join(' | ')}</div>
                        </div>
                    )}
                    {userHasAccess && canEdit && Object.keys(teamPerformanceRowsByDivision).length == 0 && (
                        <div><i>Please upload team performances first.</i></div>
                    )}
                </>}
            </div>
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
                            {userHasAccess && canEdit && (
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
        </div >
    )

}