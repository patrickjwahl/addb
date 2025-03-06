import '@/client/styles.css'
import API from '@/client/API'
import { Link } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { MatchPreviews, StudentLeaderboard, StudentLeaders } from '../shared/types/response'
import { ftoa, matchSubtitle, matchTitle, rankToClass } from '@/shared/util/functions'
import { friendlyGPA, friendlyRound } from '@/shared/util/consts'

export default function Home() {

    const [recents, setRecents] = useState<MatchPreviews | null>(null)
    // const [nationals, setNationals] = useState<MatchPreviews | null>(null)
    const [topStudents, setTopStudents] = useState<StudentLeaderboard | null>(null)

    const getRecents = async () => {
        const result = (await API.getRecentMatches()).data
        setRecents(result || [])
    }

    // const getNationals = async () => {
    //     const result = (await API.getNationalsResults(3)).data
    //     setNationals(result || [])
    // }

    const getTopStudents = async () => {
        const result = (await API.getStudentLeaderboard()).data
        console.log(result)
        setTopStudents(result || null)
    }

    let statesList = ['California', 'Indiana', 'Connecticut', 'Texas', 'Arizona', 'Wisconsin', 'Ohio', "Pennsylvania", 'Alaska',
        'Illinois', 'Iowa', 'Massachusetts', 'New_Jersey', 'Nebraska', 'Utah', 'Georgia', 'Maine', 'Rhode_Island'].sort()

    useEffect(() => {
        getRecents()
        // getNationals()
        getTopStudents()
    }, [])


    let recentsCol
    if (!recents) {
        recentsCol = <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    } else {
        recentsCol = (
            <div className='home-column'>
                <h3 className='home-column-title'>Recent Matches</h3>
                <div className='home-column-content'>
                    {recents.map(match => (
                        <Link to={`/match/${match.id}`}>
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
                    ))}
                </div>
            </div>
        )
    }

    let topStudentsCol
    if (!topStudents) {
        topStudentsCol = <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    } else {
        topStudentsCol = (
            <div className='home-column'>
                <h3 className='home-column-title'>{topStudents.year} Top Individual Scorers</h3>
                <div className='home-row'>
                    {
                        Object.keys(topStudents.leaders).sort().map(gpa => (
                            <div key={gpa} className='home-column-content'>
                                <h4 className='home-column-subtitle'>{friendlyGPA[gpa]}</h4>
                                {
                                    topStudents.leaders[gpa as keyof StudentLeaders].map((perf, index) => (
                                        <Link to={`/student/${perf.studentId}`}>
                                            <div className='match-preview'>
                                                <div className='match-preview-title-container' style={{ fontSize: '18px' }}>{index + 1}.</div>
                                                <div className='match-preview-title-container'>
                                                    <div className='match-preview-title'>{perf.student?.name || '???'}</div>
                                                    <div className='match-preview-subtitle'>{perf.team.name}{perf.team.school?.state?.name ? ', ' + perf.team.school.state.name : ''}</div>
                                                </div>
                                                <div className='match-preview-title-container'>
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
        )
    }

    let stateCol = (
        <div className='home-column'>
            <h3 className='home-column-title'>States</h3>
            <div className='home-column-content'>
                {statesList.map(state => (
                    <Link to={`/state/${state}`}>
                        <div className='match-preview'>
                            {state.replaceAll('_', ' ')}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )

    return (
        <div className='home-container'>
            <Helmet><title>AcDecDB | The world's #1 database for Academic Decathlon</title></Helmet>
            <div className='home-row'>
                {recentsCol}
                {topStudentsCol}
                {stateCol}
            </div>
        </div>
    )

}
