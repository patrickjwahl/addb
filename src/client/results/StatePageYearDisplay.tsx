import { Prisma } from '@/generated/prisma/client'
import { StateMatches } from '@/shared/types/response'
import { ftoa, groupBy, rankToClass, regionSort } from '@/shared/util/functions'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type MatchesByRoundType = {
    roundone?: StateMatches,
    regionals?: StateMatches,
    state?: StateMatches
}

export default function StatePageYearDisplay({ year, matches, nationalsPerformances, stateName }: {
    year: number,
    matches: StateMatches,
    nationalsPerformances: Prisma.TeamPerformanceGetPayload<{ include: { team: true, match: true } }>[]
    stateName: string
}) {

    const [open, setOpen] = useState(false)

    if (!matches && !nationalsPerformances) return (null)

    const matchesByRound: MatchesByRoundType = groupBy(matches || [], match => match.round)

    const canOpen = matchesByRound.regionals && matchesByRound.regionals.length > 1 || matchesByRound.roundone && matchesByRound.roundone.length > 1

    const toggleOpen = () => {
        if (canOpen) {
            setOpen(!open)
        }
    }

    let content
    if (matchesByRound.state) {
        const m = matchesByRound.state[0]
        content = (
            <>
                <div className='search-result-subtitle'>1. {m.first} - {ftoa(m.firstScore)}</div>
                <div className='search-result-subtitle'>2. {m.second} - {ftoa(m.secondScore)}</div>
                <div className='search-result-subtitle'>3. {m.third} - {ftoa(m.thirdScore)}</div>
            </>
        )
    } else {
        content = [(
            <div>
                <br />
                <div className='search-result-subtitle'>No data!</div>
                <br />
            </div>
        )]
    }

    let link
    if (matchesByRound.state) {
        link = (
            <Link to={`/match/${matchesByRound.state[0].id}`}>
                <div className='state-page-link'>
                    <div className='search-result-title'>State</div>
                    {content}
                </div>
            </Link>
        )
    } else {
        link = (
            <div className='state-page-link state-page-link-disabled'>
                <div className='search-result-title'>State</div>
                {content}
            </div>
        )
    }
    let stateBox = (
        <div className='state-page-stack'>
            {link}
        </div>
    )

    let regionalsBox, roundoneBox
    if (open && matchesByRound.regionals) {
        regionalsBox = (
            <div className='state-page-stack'>
                {matchesByRound.regionals.map(match => {
                    return (
                        <Link key={match.id} to={`/match/${match.id}`} className='state-page-stack-link' >
                            <div className='state-page-link'>
                                <div className='search-result-title'>{match.region}</div>
                                <div className='search-result-subtitle'>1. {match.first} - {ftoa(match.firstScore)}</div>
                                <div className='search-result-subtitle'>2. {match.second} - {ftoa(match.secondScore)}</div>
                                <div className='search-result-subtitle'>3. {match.third} - {ftoa(match.thirdScore)}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    } else {
        let allScores: { name: string, score: number }[] = []
        matchesByRound.regionals && matchesByRound.regionals.forEach(match => {
            allScores.push({ name: match.first, score: match.firstScore }, { name: match.second, score: match.secondScore })
            if (match.third) allScores.push({ name: match.third, score: match.thirdScore || 0 })
        })
        allScores = allScores.sort((a, b) => b.score - a.score).slice(0, 3)

        let content = allScores.map((entry, index) => (
            <div key={index} className='search-result-subtitle'>{index + 1}. {entry.name} - {ftoa(entry.score)}</div>
        ))
        let disableLink = content.length === 0
        if (content.length === 0) {
            content.push(
                <div>
                    <br />
                    <div className='search-result-subtitle'>No data!</div>
                    <br />
                </div>
            )
        }
        let link
        if (disableLink) {
            link = (
                <div className='state-page-link state-page-link-disabled'>
                    <div className='search-result-title'>Regionals</div>
                    {content}
                </div>
            )
        } else {
            link = (
                <Link to={`/regionals/${stateName}/${year}`} >
                    <div className='state-page-link'>
                        <div className='search-result-title'>Regionals</div>
                        {content}
                    </div>
                </Link>
            )
        }
        regionalsBox = (
            <div className='state-page-stack'>
                {link}
            </div>
        )
    }
    if (open && matchesByRound.roundone) {
        roundoneBox = (
            <div className='state-page-stack'>
                {matchesByRound.roundone.map(match => {
                    return (
                        <Link key={match.id} to={`/match/${match.id}`} className='state-page-stack-link' >
                            <div className='state-page-link'>
                                <div className='search-result-title'>{match.region}</div>
                                <div className='search-result-subtitle'>1. {match.first} - {ftoa(match.firstScore)}</div>
                                <div className='search-result-subtitle'>2. {match.second} - {ftoa(match.secondScore)}</div>
                                <div className='search-result-subtitle'>3. {match.third} - {ftoa(match.thirdScore)}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    } else {
        let allScores: { name: string, score: number }[] = []
        matchesByRound.roundone && matchesByRound.roundone.forEach(match => {
            allScores.push({ name: match.first, score: match.firstScore }, { name: match.second, score: match.secondScore })
            if (match.third) allScores.push({ name: match.third, score: match.thirdScore || 0 })
        })
        allScores = allScores.sort((a, b) => b.score - a.score).slice(0, 3)

        let content = allScores.map((entry, index) => (
            <div key={index} className='search-result-subtitle'>{index + 1}. {entry.name} - {ftoa(entry.score)}</div>
        ))
        let disableLink = content.length === 0
        if (content.length === 0) {
            content.push(
                <div>
                    <br />
                    <div className='search-result-subtitle'>No data!</div>
                    <br />
                </div>
            )
        }
        let r1link
        if (disableLink) {
            r1link = (
                <div className='state-page-link state-page-link-disabled'>
                    <div className='search-result-title'>Round One</div>
                    {content}
                </div>
            )
        } else if (matchesByRound.roundone) {
            r1link = (
                <Link to={`/match/${matchesByRound.roundone[0].id}`} >
                    <div className='state-page-link'>
                        <div className='search-result-title'>Round One</div>
                        {content}
                    </div>
                </Link>
            )
        } else {
            r1link = (
                <div className='state-page-link state-page-fake-link'>
                    <div className='search-result-title'>Round One</div>
                    {content}
                </div>
            )
        }
        roundoneBox = (
            <div className='state-page-stack'>
                {r1link}
            </div>
        )
    }

    let allRegionals: { name: string, score: number }[] = []
    matchesByRound.regionals && matchesByRound.regionals.forEach(match => {
        allRegionals.push({ name: match.first, score: match.firstScore }, { name: match.second, score: match.secondScore })
        if (match.third) allRegionals.push({ name: match.third, score: match.thirdScore || 0 })
    })
    allRegionals = allRegionals.sort((a, b) => b.score - a.score).slice(0, 3)

    const regionalMatches = useMemo(() => {
        if (!matchesByRound.regionals) return []
        return matchesByRound.regionals.sort((a, b) => {
            return regionSort(a.region || '', b.region || '')
        })
    }, [matchesByRound.regionals])

    return (
        <div className='info-page state-page-year-bar'>
            <div className='info-page-header'>
                <div className='info-title'>{year}</div>
            </div>
            <div className='state-page-year-row'>
                {
                    nationalsPerformances.length > 0 ? (
                        <Link to={`/match/${nationalsPerformances[0].matchId}`}>
                            <div className='match-preview state-page-link'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>Nationals</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    {
                                        nationalsPerformances.map((perf, index) => (
                                            <div key={index} className={'match-preview-team ' + rankToClass(perf.rank - 1)}>
                                                {perf.team.name} - {ftoa(perf.overall)}
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link to="#">
                            <div className='match-preview state-page-link-disabled'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>Nationals</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    No data!
                                </div>
                            </div>
                        </Link>
                    )
                }
                {
                    matchesByRound.state ? (
                        <Link to={`/match/${matchesByRound.state[0].id}`}>
                            <div className='match-preview state-page-link'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>State</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    {
                                        matchesByRound.state[0].first && (
                                            <div className='match-preview-team gold'>
                                                {matchesByRound.state[0].first} - {ftoa(matchesByRound.state[0].firstScore)}
                                            </div>
                                        )
                                    }
                                    {
                                        matchesByRound.state[0].second && (
                                            <div className='match-preview-team silver'>
                                                {matchesByRound.state[0].second} - {ftoa(matchesByRound.state[0].secondScore)}
                                            </div>
                                        )
                                    }
                                    {
                                        matchesByRound.state[0].third && (
                                            <div className='match-preview-team bronze'>
                                                {matchesByRound.state[0].third} - {ftoa(matchesByRound.state[0].thirdScore)}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link to={'#'}>
                            <div className='match-preview state-page-link-disabled'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>State</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    No data!
                                </div>
                            </div>
                        </Link>
                    )
                }
                {
                    allRegionals.length > 0 ? (
                        <Link to={`/regionals/${stateName}/${year}`}>
                            <div className='match-preview state-page-link'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>Regionals</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    <div className='match-preview-team gold'>
                                        {allRegionals[0].name} - {ftoa(allRegionals[0].score)}
                                    </div>
                                    <div className='match-preview-team silver'>
                                        {allRegionals[1].name} - {ftoa(allRegionals[1].score)}
                                    </div>
                                    {
                                        allRegionals.length > 2 && (
                                            <div className='match-preview-team bronze'>
                                                {allRegionals[2].name} - {ftoa(allRegionals[2].score)}
                                            </div>
                                        )
                                    }
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <Link to={'#'}>
                            <div className='match-preview state-page-link-disabled'>
                                <div className='match-preview-title-container'>
                                    <div className='match-preview-title'>Regionals</div>
                                </div>
                                <div className='match-preview-team-container'>
                                    No data!
                                </div>
                            </div>
                        </Link>
                    )
                }
            </div>
            {
                regionalMatches.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className="roster-container" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', padding: '5px', justifyContent: 'center' }}>
                            <div style={{ fontWeight: 'bold' }}>Regions:</div>
                            {
                                regionalMatches.map(match => {
                                    return (
                                        <Link to={`/match/${match.id}`}><div>{match.region}</div></Link>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}