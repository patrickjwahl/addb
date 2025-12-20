import { Match, UserPreferences } from "@/shared/types/response"
import api from "../API"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { divisionSort } from "@/shared/util/functions"
import { divisions } from "@/shared/util/consts"
import MatchTables from "./MatchTables"
import { ColorRing } from "react-loader-spinner"

type MatchWithTitle = {
    title?: string,
    match: Match
}

type MatchTablesControlProps = {
    matches: MatchWithTitle[],
    editing?: boolean,
    startLoading: () => void,
    refresh: () => void,
    initSchoolFilter?: number
}

export type ShowMedalsOptions = {
    overall: string,
    none: string,
    division: string,
    gpa: string,
    gpa_division: string
}

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

const defaultSortIndex = 1
const defaultSortDesc = false
const defaultGpaFilter = 'all'
const defaultSchoolFilter = -1
const defaultDivisionFilter = 'all'
const defaultPartitionBy = 'overall'
const defaultShowMedals = true
const defaultRankBy = 'overall'

export default function MatchTablesControl({
    matches,
    editing,
    startLoading,
    refresh,
    initSchoolFilter
}: MatchTablesControlProps) {

    let searchParams = Object.fromEntries(new URLSearchParams(window.location.search)) as SearchParams

    const [sortIndex, _setSortIndex] = useState(searchParams.sortIndex ? parseInt(searchParams.sortIndex) : defaultSortIndex)
    const [sortDesc, _setSortDesc] = useState(searchParams.sortDesc === 'true' || defaultSortDesc)
    const [gpaFilter, _setGpaFilter] = useState(searchParams.gpa || defaultGpaFilter)
    const [schoolFilter, _setSchoolFilter] = useState(searchParams.school ? parseInt(searchParams.school) : initSchoolFilter || defaultSchoolFilter)
    const [divisionFilter, _setDivisionFilter] = useState(searchParams.division || defaultDivisionFilter)
    const [partitionBy, _setPartitionBy] = useState<keyof ShowMedalsOptions>(searchParams.partition || defaultPartitionBy)
    const [showMedals, _setShowMedals] = useState((searchParams.medals !== undefined) ? searchParams.medals === 'true' : defaultShowMedals)
    const [rankBy, _setRankBy] = useState<keyof ShowMedalsOptions>(searchParams.rank || defaultRankBy)
    const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null)
    const [isInitialized, setIsInitialized] = useState(false)

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

    const restoreDefaults = () => {
        setGpaFilter(userPreferences?.gpa || defaultGpaFilter)
        setSchoolFilter(initSchoolFilter || defaultSchoolFilter)
        setDivisionFilter(defaultDivisionFilter)
        setPartitionBy(userPreferences?.partition as keyof ShowMedalsOptions || defaultPartitionBy)
        setShowMedals(userPreferences?.medals != undefined ? userPreferences.medals : defaultShowMedals)
        setRankBy(userPreferences?.rank as keyof ShowMedalsOptions || defaultRankBy)
    }

    const schoolNameToId: { [name: string]: number } = useMemo(() => {
        return matches.flatMap(m => m.match?.teamPerformances).reduce((prev, perf) => {
            if (perf?.team.school) return {
                ...prev, [perf.team.school.fullName || perf.team.school.name]: perf.team.schoolId
            }
            return prev
        }, {})
    }, [matches])

    const anyMatchHasDivisions = useMemo(() => matches.some(m => m.match?.hasDivisions), [matches])
    const uniqueDivisions = [...new Set(matches.flatMap(m => m.match?.teamPerformances).map(perf => perf?.division))].filter(d => d != null)

    const privateAccess = useMemo(() => api.hasPrivateAccess(), [])
    const someHaveIndividuals = privateAccess || matches.some(m => m.match?.access && m.match.access < 3)

    const initialize = async () => {
        if (api.isLoggedIn()) {
            let preferences = (await api.getPreferences()).data
            if (preferences) {
                setGpaFilter(searchParams.gpa || preferences.gpa)
                setShowMedals(searchParams.medals !== undefined ? searchParams.medals == 'true' : preferences.medals)
                let partition = preferences.partition as keyof ShowMedalsOptions
                let rank = preferences.rank as keyof ShowMedalsOptions
                if (!anyMatchHasDivisions) {
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
                setIsInitialized(true)
            }
        }
    }

    useEffect(() => {
        initialize()
    }, [])

    if (!isInitialized) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    return (
        <div>
            <div className="divisions-and-filters">
                <div className="left-align-column">
                    <div className="title">Partition By</div>
                    <select style={{ fontWeight: partitionBy == (userPreferences?.partition || defaultPartitionBy) ? 'normal' : 'bold' }} value={partitionBy} onChange={e => setPartitionBy(e.target.value as keyof ShowMedalsOptions)}>
                        <option value={'overall'}>Overall</option>
                        {anyMatchHasDivisions && <option value={'division'}>Division</option>}
                        <option value={'gpa'}>GPA</option>
                        {anyMatchHasDivisions && <option value="gpa_division">Division & GPA</option>}
                    </select>
                </div>
                {
                    anyMatchHasDivisions &&
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
                    someHaveIndividuals &&
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
                    <select style={{ fontWeight: schoolFilter == (initSchoolFilter || -1) ? 'normal' : 'bold' }} value={schoolFilter} onChange={e => setSchoolFilter(parseInt(e.target.value))}>
                        <option value={-1}>All</option>
                        {Object.keys(schoolNameToId).sort().map(name => {
                            return <option key={name} value={schoolNameToId[name]}>{name}</option>
                        })}
                    </select>
                </div>
                {
                    someHaveIndividuals &&
                    <div className="left-align-column">
                        <div className="title">Rank By</div>
                        <select style={{ fontWeight: rankBy == (userPreferences?.rank || defaultRankBy) ? 'normal' : 'bold' }} value={rankBy} onChange={e => setRankBy(e.target.value as keyof ShowMedalsOptions)}>
                            <option value={'overall'}>Overall</option>
                            {anyMatchHasDivisions && <option value={'division'}>Division</option>}
                            <option value={'gpa'}>GPA</option>
                            {anyMatchHasDivisions && <option value="gpa_division">Division & GPA</option>}
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
            {
                matches.map((match, index) => {
                    return (
                        <div key={index}>
                            {match.title && <div className="info-page-section-uberheader"><Link to={`/match/${match.match?.id}`}>{match.title}</Link></div>}
                            <MatchTables match={match.match} editing={editing} sortIndex={sortIndex} sortDesc={sortDesc} gpaFilter={gpaFilter} schoolFilter={schoolFilter} divisionFilter={divisionFilter} partitionBy={partitionBy} showMedals={showMedals} rankBy={rankBy} setSort={setSort} startLoading={startLoading} refreshMatch={refresh} />
                            {(index < matches.length - 1) && <div style={{ display: 'flex', justifyContent: 'center' }}>
                                <div style={{ width: '100%', borderBottom: '1px solid #ff3b3f', marginTop: 40 }}></div>
                            </div>}
                        </div>
                    )
                })
            }
        </div>
    )

}