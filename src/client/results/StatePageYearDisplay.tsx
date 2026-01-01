import { Prisma } from '@/generated/prisma/client'
import { StateMatches } from '@/shared/types/response'
import { ftoa, groupBy, rankToClass, regionSort } from '@/shared/util/functions'
import { useMemo } from 'react'
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

    if (!matches && !nationalsPerformances) return (null)

    const matchesByRound: MatchesByRoundType = groupBy(matches || [], match => match.round)

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
            <div className='state-page-year-row' style={{ textAlign: 'center' }}>
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
                                                {perf.team.name} - {ftoa(perf.overall)} ({perf.rank})
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