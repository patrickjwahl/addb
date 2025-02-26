import api from '@/client/API'
import { SchoolMetadata } from '@/shared/types/request'
import { Match, SearchResultSchool } from '@/shared/types/response'
import { ChangeEventHandler, KeyboardEventHandler, useState } from 'react'

var mouseDownHappened = false
var intervalId = 0

export default function SchoolSelect({ currentName, selectedSchool, selectSchool, unselectSchool, match }: {
    currentName: string,
    selectSchool: (person: SearchResultSchool) => void,
    unselectSchool: () => void,
    selectedSchool: SearchResultSchool | null,
    match?: Match
}) {

    const [query, setQuery] = useState('')
    const [result, setResult] = useState<SearchResultSchool[]>([])
    const [focus, setFocus] = useState(-1)

    const handleResultClick = (schoolId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        mouseDownHappened = true
        handleOnBlur()
        let school = result.filter(function (obj) {
            return obj.id === schoolId
        })[0]
        selectSchool(school)
    }

    const createSchool = async () => {
        const data: SchoolMetadata = {
            name: currentName
        }
        if (match?.regionId) {
            data.regionId = match.regionId
        }
        const result = await api.upsertSchool(data)
        if (result.success && result.data) {
            selectSchool(result.data)
        } else {
            alert(result.message)
        }
    }

    const handleOnBlur = () => {
        clearTimeout(intervalId)
        if (!mouseDownHappened) {
            setResult([])
            setFocus(-1)
        }
        mouseDownHappened = false
    }

    const handleInputOnKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
        if (result) {
            let keynum
            if (window.event) {
                keynum = e.keyCode
            } else {
                keynum = e.which
            }

            if (keynum === 40) {
                if (focus < result.length - 1) {
                    setFocus(focus + 1)
                    e.preventDefault()
                }
            } else if (keynum === 38) {
                if (focus > -1) {
                    setFocus(focus + 1)
                    e.preventDefault()
                }
            } else if (keynum === 13) {
                if (focus > -1) {
                    e.preventDefault()
                    handleOnBlur()

                    selectSchool(result[focus])
                }
            } else {
                setFocus(-1)
            }
        }
    }

    const quickSearch = async (query: string) => {
        const result = (await api.search(query, 3)).data
        setResult(result?.schools || [])
    }

    const handleQueryChanged: ChangeEventHandler<HTMLInputElement> = (e) => {
        let lQuery = e.target.value
        clearTimeout(intervalId)
        setQuery(lQuery)
        if (lQuery.length < 3) {
            setResult([])
            return
        }
        intervalId = window.setTimeout(() => quickSearch(lQuery), 100)
    }

    let quickResult

    if (result.length > 0) {
        quickResult = (
            <ul className='quick-result-list'>
                {
                    result.map((school, index) => {
                        let liClass
                        if (index === focus) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        let parenthesis = []
                        if (school.city) parenthesis.push(school.city)
                        if (school.state) parenthesis.push(school.state.name)
                        return (
                            <li className={liClass} key={school.id} onMouseDown={e => handleResultClick(school.id, e)}>
                                <div className='quick-result-title'>{school.fullName || school.name}</div>
                                {parenthesis.length > 0 && <div className='quick-result-subtitle'>{parenthesis.join(', ')}</div>}
                            </li>
                        )
                    })
                }
            </ul>
        )
    } else {
        quickResult = (null)
    }

    let selectedSchoolDiv
    if (selectedSchool) {
        let parenthesis = []
        if (selectedSchool.city) parenthesis.push(selectedSchool.city)
        if (selectedSchool.state) parenthesis.push(selectedSchool.state.name)
        selectedSchoolDiv = (
            <div>
                <div className='selected-school'>{selectedSchool.fullName || selectedSchool.name} {parenthesis.length > 0 ? `(${parenthesis.join(',')})` : ''}
                    <button className='selected-school-button' type="button" onClick={() => { setQuery(''); unselectSchool() }}>x</button>
                </div>
            </div>
        )
    } else {
        selectedSchoolDiv = (null)
    }

    return (
        <div className='form-field'>
            <label className='form-label'>{currentName}</label>
            <div tabIndex={0} onBlur={handleOnBlur} className='quick-result-box'>
                <input placeholder='Link to school' className='form-text-input' type='text' value={query} onChange={handleQueryChanged} onKeyDown={handleInputOnKeyDown} />
                {quickResult}
            </div>
            {!selectedSchool && <div style={{ marginTop: 5 }}><button onClick={createSchool}>Create School</button></div>}
            {selectedSchoolDiv}
        </div>
    )
}