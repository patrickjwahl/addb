import qs from 'qs'
import '@/client/styles.css'
import { Link, useLocation } from 'react-router-dom'
import Home from '@/client/Home'
import { friendlyRound } from '@/shared/util/consts'
import { Helmet } from 'react-helmet'
import { useEffect, useState } from 'react'
import { SearchResult as SearchResultType } from '@/shared/types/response'
import api from '@/client/API'

export default function SearchResult() {

    const location = useLocation()

    const [result, setResult] = useState<SearchResultType | null | undefined>()

    const performSearch = async () => {
        let query = qs.parse(location.search, { ignoreQueryPrefix: true }).query
        if (!query) return
        const result = await api.search(query.toString(), 50)
        if (result.success) {
            setResult(result.data)
        }
    }

    useEffect(() => {
        performSearch()
    }, [location.search])

    let retval

    let schoolResults = (null)
    let peopleResults = (null)
    let matchResults = (null)

    let resultsFound = false

    if (!result && !location.search) {
        retval = <Home />
    } else if (!result) {
        retval = <div>Loading...</div>
    } else {
        if (result.schools.length > 0) {
            schoolResults = (
                <div className='search-result-category'>
                    <div className='search-result-category-title'>Schools</div>
                    <ul className='search-result-sublist'>
                        {
                            result.schools.map((school) => (
                                <Link to={`/school/${school.id}`} key={school.id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{school.fullName || school.name}</div>
                                        <div className='search-result-subtitle'>{school.city ? school.city + ', ' : ''}{school.state?.name || ''}</div>
                                    </li>
                                </Link>
                            ))
                        }
                    </ul>
                </div>
            )
            resultsFound = true
        }

        if (result.students.length > 0) {
            peopleResults = (
                <div className='search-result-category'>
                    <div className='search-result-category-title'>Decathletes</div>
                    <ul className='search-result-sublist'>
                        {
                            result.students.map((person) => {
                                const school = person.performances.length > 0 ? person.performances[0].team.school : null
                                return <Link to={`/student/${person.id}`} key={person.id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{person.name}</div>
                                        {school && <div className='search-result-subtitle'>{school.name + (school.city ? `, ${school.city}` : '') + (school.state ? `, ${school.state.name}` : '')}</div>}
                                    </li>
                                </Link>
                            })
                        }
                    </ul>
                </div>
            )
            resultsFound = true
        }

        if (result.matches.length > 0) {
            matchResults = (
                <div className='search-result-category'>
                    <div className='search-result-category-title'>Matches</div>
                    <ul className='search-result-sublist'>
                        {
                            result.matches.map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{match.year + ' ' + friendlyRound[match.round]}</div>
                                        <div className='search-result-subtitle'>{match.state?.name || match.site || ''} {match.region?.name || ''}</div>
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
                <div className='search-result-list'>
                    {schoolResults}
                    {peopleResults}
                    {matchResults}
                </div>
            )
        } else {
            retval = <div className='search-result-none'>No results found</div>
        }
    }

    return (
        <div>
            <Helmet><title>{`Search for "${qs.parse(location.search, { ignoreQueryPrefix: true }).query}" | AcDecDB`}</title></Helmet>
            {retval}
        </div>
    )
}