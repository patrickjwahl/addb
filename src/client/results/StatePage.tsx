import API from '@/client/API'
import StatePageYearDisplay from '@/client/results/StatePageYearDisplay'
import { StateMatches } from '@/shared/types/response'
import { taglines } from '@/shared/util/consts'
import { groupBy } from '@/shared/util/functions'
import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useParams } from 'react-router-dom'

export default function StatePage() {

    const [matches, setMatches] = useState<StateMatches | null>(null)

    const params = useParams()

    const performSearch = async () => {
        const results = (await API.getStateResults(params.name || '')).data
        if (results) {
            setMatches(results)
        }
    }

    useEffect(() => {
        performSearch()
    }, [params.name])

    const stateName: string = params.name || ''

    let retval

    let matchesByYear = groupBy(matches || [], match => match.year)

    let resultsFound = false

    if (!matches) {
        retval = <div>Loading...</div>
    } else {
        let yearViews
        if (matches.length > 0) {
            resultsFound = true

            yearViews = Object.keys(matchesByYear).map(Number).sort((a, b) => b - a).map(year => <StatePageYearDisplay data={matchesByYear[year]} year={year} stateName={stateName} />)
        }

        const { name } = params

        if (resultsFound && name) {
            retval = (
                <div className='state-page-container'>
                    <Helmet><title>{name.replace('_', ' ')} | AcDecDB</title></Helmet>
                    <div className={'state-page-header'} style={{ backgroundImage: `url(/img/${name}.jpg)` }}>
                        <div className='state-page-header-text'>
                            {/* <img src={`/img/${name}.jpg`} height={50} /> */}
                            <div className='state-tagline' style={{ display: (name in taglines) ? 'initial' : 'none' }}>"{taglines[name]}"</div>
                            <h2>{name.replace('_', ' ').toUpperCase()}</h2>
                        </div>
                    </div>
                    {yearViews}
                </div>
            )
        } else {
            if (!name) retval = (null); else {
                retval = (
                    <div className='state-page-container'>
                        <Helmet><title>{name.replace('_', ' ')} | AcDecDB</title></Helmet>
                        <div className={'state-page-header'} style={{ backgroundImage: `url(/img/${name}.jpg)` }}>
                            <div className='state-page-header-text'>
                                {/* <img src={`/img/${name}.jpg`} height={50} /> */}
                                <div className='state-tagline' style={{ display: (name in taglines) ? 'initial' : 'none' }}>"{taglines[name]}"</div>
                                <h2>{name.replace('_', ' ').toUpperCase()}</h2>
                            </div>
                        </div>
                        <div className='search-result-none'>No results found</div>
                    </div>
                )
            }
        }
    }

    return retval
}
