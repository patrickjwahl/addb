import { Season, StudentLeaders } from "@/shared/types/response"
import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import api from "../API"
import { ColorRing } from "react-loader-spinner"
import { friendlyGPA, friendlyRound, roundOrder } from "@/shared/util/consts"
import { ftoa, groupBy, matchSubtitle, matchTitle, rankToClass } from "@/shared/util/functions"

export default function FullSeasonResult() {
    const [data, setData] = useState<Season | null>(null)
    const [error, setError] = useState<string | null>()

    const params = useParams()
    const fetchSeason = async () => {
        const result = (await api.getFullSeason(parseInt(params.year || '')))
        if (!result.success) {
            setError(result.message || 'An unexpected error occurred.')
            return
        }

        setData(result.data || null)
    }

    const matchesByRound = useMemo(() => {
        return data ? groupBy(data.matches, match => match.round as string) : {}
    }, [data])

    useEffect(() => {
        fetchSeason()
    }, [])

    if (error) {
        return <div className='error-message'>{error}</div>
    }

    if (!data) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    const { year, studentLeaders, teamLeaders } = data

    return (
        <div className="state-page-container">
            <div className={'state-page-header'}>
                <div className='state-page-header-text'>
                    {/* <img src={`/img/${name}.jpg`} height={50} /> */}
                    <h2>{year} Season</h2>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                <div className='home-column' style={{ marginTop: '10px' }}>
                    <h3 className='home-column-title' style={{ marginBottom: '2px' }}>Top Individual Scores</h3>
                    <div style={{ fontStyle: 'italic', fontSize: '11px', marginBottom: '10px' }}>Rankings are based on available data and may not be accurate</div>
                    <div className='home-row'>
                        {
                            Object.keys(studentLeaders).sort().map(gpa => (
                                <div key={gpa} className='home-column-content'>
                                    <h4 className='home-column-subtitle'>{friendlyGPA[gpa]}</h4>
                                    {
                                        studentLeaders[gpa as keyof StudentLeaders].map((perf, index) => (
                                            <Link key={index} to={`/student/${perf.studentId}`}>
                                                <div className='match-preview'>
                                                    <div className='match-preview-title-container' style={{ fontSize: '18px' }}>{index + 1}.</div>
                                                    <div className='match-preview-title-container center'>
                                                        <div className='match-preview-title'>{perf.student?.name || '???'}</div>
                                                        <div className='match-preview-subtitle'>{perf.team.name}{perf.team.school?.state?.name ? ', ' + perf.team.school.state.name : ''}</div>
                                                    </div>
                                                    <div className='match-preview-title-container center'>
                                                        <div className={`match-preview-title ${rankToClass(index)}`} style={{ border: '1px solid black', borderRadius: '5px', padding: '5px' }}>
                                                            {ftoa(perf.overall)}
                                                        </div>
                                                        <div>
                                                            {friendlyRound[perf.match.round]}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    }
                                </div>
                            ))
                        }
                    </div>
                </div>
                <div className="home-column" style={{ marginTop: '10px' }}>
                    <h3 className='home-column-title' style={{ marginBottom: '20px' }}>Top Team Scores</h3>
                    <div className='home-column-content'>
                        {
                            teamLeaders.map((team, index) => (
                                <Link key={team.id} to={`/school/${team.team.schoolId}`}>
                                    <div className='match-preview'>
                                        <div className='match-preview-title-container' style={{ fontSize: '18px' }}>{index + 1}.</div>
                                        <div className='match-preview-title-container center'>
                                            <div className='match-preview-title'>{team.team.name || '???'}</div>
                                            <div className='match-preview-subtitle'>{team.team.school?.city || ''}{team.team.school?.city && team.team.school.state && ', '}{team.team.school?.state?.name || ''}</div>
                                        </div>
                                        <div className='match-preview-title-container center'>
                                            <div className={`match-preview-title ${rankToClass(index)}`} style={{ border: '1px solid black', borderRadius: '5px', padding: '5px' }}>
                                                {ftoa(team.overall)}
                                            </div>
                                            <div>
                                                {friendlyRound[team.match.round]}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        }
                    </div>
                </div>
            </div>
            {
                roundOrder.toReversed().map(round => {
                    return (
                        <div className="info-page">
                            <div className='info-page-header'>
                                <div className='info-title'>{friendlyRound[round]}</div>
                            </div>
                            <div className='season-page-round-row'>
                                {matchesByRound[round] && matchesByRound[round].length > 0 && matchesByRound[round]?.map(match => {
                                    return (
                                        <Link key={match.id} to={`/match/${match.id}`}>
                                            <div key={match.id} className='match-preview'>
                                                <div className='match-preview-title-container'>
                                                    <div className='match-preview-title'>{matchTitle(match)}</div>
                                                    <div className='match-preview-subtitle'>{matchSubtitle(match)}</div>
                                                </div>
                                                <div className='match-preview-team-container'>
                                                    {
                                                        match.teamPerformances.map((perf, index) => (
                                                            <div key={index} className={'match-preview-team ' + rankToClass(index)}>
                                                                {perf.team.name} - {ftoa(perf.overall)}
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                                {(!matchesByRound[round] || matchesByRound[round]?.length == 0) &&
                                    <div style={{ fontStyle: 'italic' }}>No data!</div>
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}