import api from "@/client/API"
import Table, { Column } from "@/client/components/table/Table"
import { FullStudentPerformance, Match, StudentPerformance, TeamPerformance, UserPreferences } from "@/shared/types/response"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, divisionSort, groupBy, partitionSort } from "@/shared/util/functions"
import { divisions, friendlyColumn, friendlyGPA, friendlyRound, fullColumn } from "@/shared/util/consts"
import StudentPerformanceRow from "@/client/components/table/StudentPerformanceRow"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import TeamPerformanceRow from "@/client/components/table/TeamPerformanceRow"
import StudentAggregateRow from "@/client/components/table/StudentAggregateRow"
import MatchPropertiesEdit from "@/client/components/edit/MatchPropertiesEdit"
import { Tooltip } from "react-tooltip"

type SearchParams = {
    partition?: keyof ShowMedalsOptions,
    gpa?: string,
    school?: string,
    rank?: keyof ShowMedalsOptions,
    medals?: string,
    division?: string,
    sortIndex?: string,
    sortDesc?: string
}

type StudentPerformanceColumn = {
    name: string,
    tip?: string,
    sortKey: (val: StudentPerformance) => number | string
}

export type ShowMedalsOptions = {
    overall: string,
    none: string,
    division: string,
    gpa: string,
    gpa_division: string
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

export default function MatchResult2() {

    let searchParams = Object.fromEntries(new URLSearchParams(window.location.search)) as SearchParams

    const defaultSortIndex = 1
    const defaultSortDesc = false
    const defaultGpaFilter = 'all'
    const defaultSchoolFilter = -1
    const defaultDivisionFilter = 'all'
    const defaultPartitionBy = 'overall'
    const defaultShowMedals = true
    const defaultRankBy = 'overall'

    const [match, setMatch] = useState<Match>()
    const [editing, setEditing] = useState(false)
    const [sortIndex, _setSortIndex] = useState(searchParams.sortIndex ? parseInt(searchParams.sortIndex) : defaultSortIndex)
    const [sortDesc, _setSortDesc] = useState(searchParams.sortDesc === 'true' || defaultSortDesc)
    const [isDeleted, setIsDeleted] = useState(false)
    const [gpaFilter, _setGpaFilter] = useState(searchParams.gpa || defaultGpaFilter)
    const [schoolFilter, _setSchoolFilter] = useState(searchParams.school ? parseInt(searchParams.school) : defaultSchoolFilter)
    const [divisionFilter, _setDivisionFilter] = useState(searchParams.division || defaultDivisionFilter)
    const [partitionBy, _setPartitionBy] = useState<keyof ShowMedalsOptions>(searchParams.partition || defaultPartitionBy)
    const [showMedals, _setShowMedals] = useState((searchParams.medals !== undefined) ? searchParams.medals === 'true' : defaultShowMedals)
    const [rankBy, _setRankBy] = useState<keyof ShowMedalsOptions>(searchParams.rank || defaultRankBy)
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
    const [error, setError] = useState<string | null>(null)

    const updateBrowserParams = () => {
        const newParams = new URLSearchParams(searchParams)
        window.history.replaceState({}, "", "?" + newParams.toString())
    }

    const setSortIndex = (index: number) => {
        searchParams.sortIndex = index.toString()
        updateBrowserParams()
        _setSortIndex(index)
    }

    const setSortDesc = (desc: boolean) => {
        searchParams.sortDesc = desc.toString()
        updateBrowserParams()
        _setSortDesc(desc)
    }

    const setGpaFilter = (gpa: string) => {
        searchParams.gpa = gpa
        updateBrowserParams()
        _setGpaFilter(gpa)
    }

    const setSchoolFilter = (school: number) => {
        searchParams.school = school.toString()
        updateBrowserParams()
        _setSchoolFilter(school)
    }

    const setDivisionFilter = (division: string) => {
        searchParams.division = division
        updateBrowserParams()
        _setDivisionFilter(division)
    }

    const setPartitionBy = (partition: keyof ShowMedalsOptions) => {
        searchParams.partition = partition
        updateBrowserParams()
        _setPartitionBy(partition)
    }

    const setShowMedals = (show: boolean) => {
        searchParams.medals = show.toString()
        updateBrowserParams()
        _setShowMedals(show)
    }

    const setRankBy = (rank: keyof ShowMedalsOptions) => {
        searchParams.rank = rank
        updateBrowserParams()
        _setRankBy(rank)
    }

    const restoreDefaults = () => {
        setGpaFilter(userPreferences?.gpa || defaultGpaFilter)
        setSchoolFilter(defaultSchoolFilter)
        setDivisionFilter(defaultDivisionFilter)
        setPartitionBy(userPreferences?.partition as keyof ShowMedalsOptions || defaultPartitionBy)
        setShowMedals(userPreferences?.medals != undefined ? userPreferences.medals : defaultShowMedals)
        setRankBy(userPreferences?.rank as keyof ShowMedalsOptions || defaultRankBy)
    }

    const params = useParams()

    const fetchMatch = useCallback(async () => {
        const result = (await api.getMatch(params.id || ''))
        if (!result.success) {
            setError(result.message || 'An unexpected error occurred.')
            return
        }

        if (api.isLoggedIn()) {
            let preferences = (await api.getPreferences()).data
            if (preferences) {
                setGpaFilter(searchParams.gpa || preferences.gpa)
                setShowMedals(searchParams.medals !== undefined ? searchParams.medals == 'true' : preferences.medals)
                let partition = preferences.partition as keyof ShowMedalsOptions
                let rank = preferences.rank as keyof ShowMedalsOptions
                if (!result.data?.hasDivisions) {
                    if (partition === 'gpa_division') {
                        preferences.partition = 'gpa'
                    } else if (partition === 'division') {
                        preferences.partition = 'overall'
                    }

                    if (rank === 'gpa_division') {
                        preferences.rank = 'gpa'
                    } else if (rank === 'division') {
                        preferences.rank = 'overall'
                    }
                }
                setPartitionBy(searchParams.partition || preferences.partition as keyof ShowMedalsOptions)
                setRankBy(searchParams.rank || preferences.rank as keyof ShowMedalsOptions)
                setUserPreferences(preferences)
            }
        }

        setMatch(result.data)
    }, [params.id])

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
        setMatch(null)
        if (!match || !input.files || input.files.length < 1) return
        formData.append('teamData', input.files[0])
        const result = await api.uploadTeamPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        }
        fetchMatch()
    }

    const uploadStudentCSV = async () => {
        let formData = new FormData()
        const input = document.getElementById('student-data-upload') as HTMLInputElement
        setMatch(null)
        if (!match || !input.files || input.files.length < 1) return
        formData.append('studentData', input.files[0])
        const result = await api.uploadStudentPerformances(match.id, formData)
        if (!result.success) {
            alert(result.message)
        }
        fetchMatch()
    }

    const teams = match?.teamPerformances.map(perf => ({
        name: perf.team?.name || '',
        id: perf.teamId || -1
    })) || []

    const canEdit = useMemo(() => api.canEdit(), [])
    const privateAccess = useMemo(() => api.hasPrivateAccess(), [])
    const individualsHidden = !privateAccess && match?.access == 3

    const hasObjs = useMemo((): boolean => {
        return _hasObjs(match?.events, match?.year)
    }, [match?.events])

    const hasSubs = useMemo((): boolean => {
        return _hasSubs(match?.events)
    }, [match?.events])

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
        if (partitionBy == 'division' || partitionBy == 'gpa_division') return groupBy(match.teamPerformances, perf => (perf.division || 'null'))
        return { all: match.teamPerformances }
    })()

    const uniqueDivisions = [...new Set(match?.teamPerformances.map(perf => perf.division))].filter(d => d != null)

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

    if (error) {
        return <div className='error-message'>{error}</div>
    }

    if (!match) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

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
            return <TeamPerformanceRow data={performance} rank={rank} editCallback={fetchMatch} editingEnabled={editing} events={match.events} hasSq={match.hasSq} key={performance.id} match={match} showMedals={showMedals} showRegion={hasAnyRegion} />
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
                    (schoolFilter == -1 || performance.team.schoolId == schoolFilter) && rows.push(<StudentPerformanceRow data={performance} teams={teams} rankByCol={ranksByPerfId[performance.id]} teamRank={teamIdToPartitionRank[performance.team.id]} editCallback={fetchMatch} editingEnabled={editing} events={match.events} key={performance.id} showMedals={showMedals} />) && (addAggregate = true)
                })
                const teamId = (studentPerformancesByTeam[key] && studentPerformancesByTeam[key][0].teamId) || 0
                addAggregate && rows.push(<StudentAggregateRow key={teamId} data={match.aggregates[teamId]} events={match.events} year={match.year} />)
            }
            return rows
        } else {
            return performances.reduce((prev: JSX.Element[], performance) => {
                return (schoolFilter == -1 || performance.team.schoolId == schoolFilter) ? [...prev, <StudentPerformanceRow key={performance.id} teams={teams} rankByCol={ranksByPerfId[performance.id]} data={performance} teamRank={teamIdToPartitionRank[performance.team.id]} editCallback={fetchMatch} editingEnabled={editing} events={match.events} rank={sortIndex > 3 ? ranksByPerfId[performance.id][sortIndex] : undefined} showMedals={showMedals} />] : prev
            }, [])
        }
    }

    const studentPerformanceRowsByPartition: { [partition: string]: JSX.Element[] } = Object.keys(studentsByPartition).reduce((prev, partition) => {
        if (!studentsByPartition[partition]) return { ...prev, [partition]: [] }
        return { ...prev, [partition]: getStudentPerformanceRows(studentsByPartition[partition]) }
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
                        {match.note && <div className="info-note">{match.note}</div>}
                    </>
                )}
                {canEdit &&
                    <div className='header-edit-buttons'>
                        <button className="admin-button" onClick={toggleEditMode}>{editing ? 'Leave Editing Mode' : 'Edit'}</button>
                        <button className="admin-button" onClick={deleteMatch}>Delete</button>
                    </div>
                }
                <div className="divisions-and-filters">
                    <div className="left-align-column">
                        <div className="title">Partition By</div>
                        <select style={{ fontWeight: partitionBy == (userPreferences?.partition || defaultPartitionBy) ? 'normal' : 'bold' }} value={partitionBy} onChange={e => setPartitionBy(e.target.value as keyof ShowMedalsOptions)}>
                            <option value={'overall'}>Overall</option>
                            {match.hasDivisions && <option value={'division'}>Division</option>}
                            <option value={'gpa'}>GPA</option>
                            {match.hasDivisions && <option value="gpa_division">Division & GPA</option>}
                        </select>
                    </div>
                    {
                        match.hasDivisions &&
                        <div className="left-align-column">
                            <div className="title">Filter by Division</div>
                            <select style={{ fontWeight: divisionFilter == 'all' ? 'normal' : 'bold' }} value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}>
                                <option value={'all'}>All</option>
                                {
                                    [...uniqueDivisions].sort(divisionSort).map(division => (
                                        <option key={division} value={division}>{divisions[division]}</option>
                                    ))
                                }
                            </select>
                        </div>
                    }
                    {
                        !individualsHidden &&
                        <div className="left-align-column">
                            <div className="title">Filter by GPA</div>
                            <select style={{ fontWeight: gpaFilter == (userPreferences?.gpa || defaultGpaFilter) ? 'normal' : 'bold' }} value={gpaFilter} onChange={e => setGpaFilter(e.target.value)}>
                                <option value='all'>All</option>
                                <option value='H'>H</option>
                                <option value='S'>S</option>
                                <option value='V'>V</option>
                            </select>
                        </div>
                    }
                    <div className="left-align-column">
                        <div className="title">Filter by School</div>
                        <select style={{ fontWeight: schoolFilter == -1 ? 'normal' : 'bold' }} value={schoolFilter} onChange={e => setSchoolFilter(parseInt(e.target.value))}>
                            <option value={-1}>All</option>
                            {Object.keys(schoolNameToId).sort().map(name => {
                                return <option key={name} value={schoolNameToId[name]}>{name}</option>
                            })}
                        </select>
                    </div>
                    {
                        !individualsHidden &&
                        <div className="left-align-column">
                            <div className="title">Rank By</div>
                            <select style={{ fontWeight: rankBy == (userPreferences?.rank || defaultRankBy) ? 'normal' : 'bold' }} value={rankBy} onChange={e => setRankBy(e.target.value as keyof ShowMedalsOptions)}>
                                <option value={'overall'}>Overall</option>
                                {match.hasDivisions && <option value={'division'}>Division</option>}
                                <option value={'gpa'}>GPA</option>
                                {match.hasDivisions && <option value="gpa_division">Division & GPA</option>}
                            </select>
                        </div>
                    }
                    <div className="left-align-column">
                        <div className="title" onClick={() => setShowMedals(!showMedals)}>Show Medals</div>
                        <input type="checkbox" checked={showMedals} onChange={() => setShowMedals(!showMedals)} />
                    </div>
                    <div className="left-align-column">
                        <button className="divisions-button" onClick={restoreDefaults}>Restore Defaults</button>
                    </div>
                    <div className="left-align-column">
                        <Link to='/preferences'><button className="divisions-button">Preferences...</button></Link>
                    </div>
                </div>
            </div>
            {(!individualsHidden || canEdit) &&
                <div className="info-page-section">
                    {hasStudentData &&
                        <div className='info-page-section-header' style={{ display: 'flex', alignItems: 'center' }}>
                            {!privateAccess && match.access == 2 && 'Outstanding '}Individual Scores
                            {!privateAccess && match.access == 2 &&
                                <span data-tooltip-id='redacted-explainer' style={{ marginLeft: 5, fontSize: '13px' }}>
                                    <Tooltip id="redacted-explainer">Only outstanding scores are available for this match. Outstanding scores are considered to be above 7,000 for Honors, 6,500 for Scholastic, and 6,000 for Varsity.</Tooltip>
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
        </div >
    )

}