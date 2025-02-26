import { Link, useNavigate } from 'react-router-dom'
import '@/client/styles.css'
import { friendlyRound } from '@/shared/util/consts'
import { useState } from 'react'
import api from '@/client/API'
import { SearchResult, SearchResultMatch, SearchResultSchool, SearchResultStudent } from '@/shared/types/response'

var mouseDownHappened = false
var intervalId: any = null

var possiblyShorten = (str: string) => {
    if (str.length > 37) {
        return str.slice(0, 30) + '...'
    }
    return str
}

export default function SearchForm() {

    const [result, setResult] = useState<SearchResult | null | undefined>(null)
    const [focus, setFocus] = useState(-1)
    const [query, setQuery] = useState('')

    const navigate = useNavigate()

    const registerMouseDown = () => {
        mouseDownHappened = true
    }

    const clearQuickResult = () => {
        setResult(null)
    }

    const quickResultNum = result ? Math.min(result.students.length, 3) + Math.min(result.schools.length, 3) + Math.min(result.matches.length, 3) : 0

    const quickSearch = async (newQuery: string) => {
        const result = await api.search(newQuery, 3)
        if (result.success && result.data && result.data.matches.length + result.data.schools.length + result.data.students.length > 0) {
            setResult(result.data)
        }
    }

    const handleQueryChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        var query = e.target.value
        clearTimeout(intervalId)
        if (query.length < 3) {
            setResult(null)
            setQuery(query)
            return
        }
        setQuery(query)
        intervalId = setTimeout(() => quickSearch(query), 200)
    }

    const handleOnBlur = () => {
        clearTimeout(intervalId)
        if (!mouseDownHappened) {
            setResult(null)
            setFocus(-1)
        }
        mouseDownHappened = false
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.length < 3) return
        handleOnBlur()
        navigate(`/search?query=${query}`)
    }

    const handleInputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (result) {
            let key = e.key


            if (key === 'ArrowDown') {
                if (focus < quickResultNum - 1) {
                    setFocus(focus + 1)
                    e.preventDefault()
                }
            } else if (key === 'ArrowUp') {
                if (focus > -1) {
                    setFocus(focus - 1)
                    e.preventDefault()
                }
            } else if (key === 'Enter') {
                if (focus > -1) {
                    e.preventDefault()
                    handleOnBlur()
                    let results: Array<SearchResultSchool | SearchResultMatch | SearchResultStudent> =
                        [...result.schools.slice(0, 3), ...result.students.slice(0, 3), ...result.matches.slice(0, 3)]

                    let selectedResult = results[focus]
                    let prefix
                    if ('year' in selectedResult) {
                        prefix = 'match'
                    } else if ('district' in selectedResult) {
                        prefix = 'school'
                    } else {
                        prefix = 'student'
                    }

                    navigate(`/${prefix}/${results[focus].id}`)
                }
            } else {
                setFocus(-1)
            }
        }
    }

    let quickResult
    let formClass

    if (result) {
        formClass = 'search-input search-input-with-results'
        quickResult = (
            <ul className='quick-result-list'>
                {
                    result.schools.map((school, index) => {
                        if (index > 2) return (null)
                        let liClass
                        if (index === focus) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        return (
                            <Link to={`/school/${school.id}`} key={school.id} onMouseDown={registerMouseDown} onClick={clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>School</div>
                                    <div className='quick-result-title'>{possiblyShorten(school.fullName || school.name)}</div>
                                    <div className='quick-result-subtitle'>{school.city ? school.city + (school.state ? ', ' : '') : ''}{school.state?.name || ''}</div>
                                </li>
                            </Link>
                        )
                    }).concat(result.students.map((person, index) => {
                        const school = person.performances.length > 0 ? person.performances[0].team.school : null
                        if (index > 2) return (null)
                        let liClass
                        if (index === focus - Math.min(result.schools.length, 3)) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        return (
                            <Link to={`/student/${person.id}`} key={person.id} onMouseDown={registerMouseDown} onClick={clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>Decathlete</div>
                                    <div className='quick-result-title'>{possiblyShorten(person.name)}</div>
                                    <div className='quick-result-subtitle'>{school?.fullName || '' + (school?.city ? `, ${school.city}` : '') + (school?.state ? `, ${school.state.name}` : '')}</div>
                                </li>
                            </Link>
                        )
                    })).concat(result.matches.map((match, index) => {
                        if (index > 2) return (null)
                        let liClass
                        if (index === focus - Math.min(result.schools.length, 3) - Math.min(result.students.length, 3)) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        return (
                            <Link to={`/match/${match.id}`} key={match.id} onMouseDown={registerMouseDown} onClick={clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>Match</div>
                                    <div className='quick-result-title'>{possiblyShorten(match.year + ' ' + friendlyRound[match.round])}</div>
                                    <div className='quick-result-subtitle'>{match.state?.name || ''} {match.region?.name || ''}</div>
                                </li>
                            </Link>
                        )
                    }))
                }
            </ul>
        )
    } else {
        formClass = 'search-input'
        quickResult = (null)
    }

    return (
        <div>
            <form className="search-form" onSubmit={handleSubmit}>
                <div className='search-input-container' tabIndex={0} onBlur={handleOnBlur}>
                    <input className={formClass} placeholder="Look for schools, people, and matches" type="text" onChange={handleQueryChanged} value={query} onKeyDown={handleInputOnKeyDown} />
                    {quickResult}
                </div>
                <input className="search-submit" type="submit" value="Search" />
            </form>
        </div>
    )
}
