import '@/client/styles.css'
import API from '@/client/API'
import { Link } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { RecentMatches } from '../shared/types/response'

export default function Home() {

    const [matches, setMatches] = useState<RecentMatches | null>()

    const getRecents = async () => {
        const result = await (await API.getRecentMatches()).data
        setMatches(result)
    }

    useEffect(() => {
        getRecents()
    }, [])

    let retval

    let resultsFound = false

    let matchResults = (null)

    let statesList = ['California', 'Indiana', 'Connecticut', 'Texas', 'Arizona', 'Wisconsin', 'Ohio', "Pennsylvania", 'Alaska',
        'Illinois', 'Iowa', 'Massachusetts', 'New_Jersey', 'Nebraska', 'Utah', 'Georgia', 'Maine', 'Rhode_Island'].sort()

    let stateLinks = (
        <div>
            <div className='search-result-category-title'>States</div>
            <div className='state-list-container'>
                {
                    statesList.map(state => (
                        <Link key={state} to={`/state/${state}`}>
                            <div className='state-list-object'>
                                <img src={`/img/${state}.jpg`} height={50} style={{ borderRadius: 5, border: '1px solid black' }} />
                                <div className='search-result-title state-button-title'>{state.replace('_', ' ')}</div>
                            </div>
                        </Link>
                    ))
                }
            </div>
        </div>
    )

    if (!matches) {
        retval = <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    } else {
        if (matches.length > 0) {
            matchResults = (
                <div className='search-result-category'>
                    <div className='search-result-category-title'>Recent Matches</div>
                    <ul className='search-result-sublist'>
                        {
                            matches.map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result' style={{ textAlign: 'center' }}>
                                        <div className='search-result-title'>{match.year} {match.round.charAt(0).toUpperCase() + match.round.slice(1)}</div>
                                        <div className='search-result-subtitle'>{(match.round !== 'nationals') ? match.state?.name + ' ' : ''}{match.round !== 'nationals' && match.round !== 'state' ? match.region?.name + ' ' : ''}</div>
                                    </li>
                                </Link>
                            ))
                        }
                    </ul>
                </div>
            )
            resultsFound = true
        }

        if (resultsFound) {
            retval = (
                <div className='state-result-list'>
                    <Helmet><title>AcDecDB | The world's #1 database for Academic Decathlon</title></Helmet>
                    <div className='flex-column'>{matchResults}</div>
                    <div className='flex-column-big'>{stateLinks}</div>
                </div>
            )
        } else {
            retval = <ColorRing
                height={40}
                width={40}
                wrapperStyle={{ marginTop: '50px' }}
                visible
            />
        }
    }

    return retval
}
