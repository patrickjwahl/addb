import { MatchPreviews } from "@/shared/types/response"
import { useEffect, useState } from "react"
import api from "../API"
import { Link } from "react-router-dom"
import { ColorRing } from "react-loader-spinner"
import { ftoa, matchSubtitle, rankToClass } from "@/shared/util/functions"
import { Helmet } from "react-helmet"

export function NationalsResult() {
    const [nationals, setNationals] = useState<null | MatchPreviews>(null)

    const fetchResults = async () => {
        const result = (await api.getNationalsResults(undefined)).data
        setNationals(result || [])
    }

    useEffect(() => {
        fetchResults()
    }, [])

    let nationalsCol
    if (!nationals) {
        nationalsCol = <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    } else {
        nationalsCol = (
            <div className='home-column-content-grid nationals-grid'>
                {nationals.map(match => (
                    <Link key={match.id} to={`/match/${match.id}`}>
                        <div key={match.id} className='match-preview'>
                            <div className='match-preview-title-container'>
                                <div className='match-preview-title'>{match.year}</div>
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
                ))}
            </div>
        )
    }

    return (
        <div className="home-column">
            <Helmet><title>Nationals | AcDecDB</title></Helmet>
            <div className='state-page-header' style={{ background: 'linear-gradient(155deg, #FFCC33, white, #FFCC33)' }}>
                <div className="state-page-header-text" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backdropFilter: 'none', background: 'none', fontSize: '24px' }}>
                    <img src={`/img/usad.png`} style={{ width: '90px' }} />
                    <h2>Nationals</h2>
                </div>
            </div>
            {nationalsCol}
        </div>
    )
}