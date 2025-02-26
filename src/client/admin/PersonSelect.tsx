import api from '@/client/API'
import { SearchResultStudent } from '@/shared/types/response'
import { ChangeEventHandler, KeyboardEventHandler, useState } from 'react'

var mouseDownHappened = false
var intervalId = 0

export default function PersonSelect({ currentName, selectedPerson, selectPerson, unselectPerson }: {
    currentName: string,
    selectPerson: (person: SearchResultStudent) => void,
    unselectPerson: () => void,
    selectedPerson: SearchResultStudent | null
}) {

    const [query, setQuery] = useState('')
    const [result, setResult] = useState<SearchResultStudent[]>([])
    const [focus, setFocus] = useState(-1)

    const handleResultClick = (personId: number, e: React.MouseEvent) => {
        e.stopPropagation()
        mouseDownHappened = true
        handleOnBlur()
        let person = result.filter(function (obj) {
            return obj.id === personId
        })[0]
        selectPerson(person)
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

                    selectPerson(result[focus])
                }
            } else {
                setFocus(-1)
            }
        }
    }

    const quickSearch = async (query: string) => {
        const result = (await api.search(query, 3)).data
        setResult(result?.students || [])
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
                    result.map((person, index) => {
                        let liClass
                        if (index === focus) {
                            liClass = 'quick-result focus'
                        } else {
                            liClass = 'quick-result'
                        }
                        return (
                            <li className={liClass} key={person.id} onMouseDown={e => handleResultClick(person.id, e)}>
                                <div className='quick-result-title'>{person.name}</div>
                                {person.performances.length > 0 && <div className='quick-result-subtitle'>{person.performances[0].team.school?.fullName || person.performances[0].team.school?.name}</div>}
                            </li>
                        )
                    })
                }
            </ul>
        )
    } else {
        quickResult = (null)
    }

    let selectedPersonDiv
    const selectedSchool = (selectedPerson?.performances.length || 0) > 0 && selectedPerson?.performances[0].team.school
    if (selectedPerson) {
        selectedPersonDiv = (
            <div>
                <div className='selected-school'>{selectedPerson.name} ({selectedSchool && (selectedSchool.fullName || selectedSchool.name)})
                    <button className='selected-school-button' type="button" onClick={() => { setQuery(''); unselectPerson() }}>x</button>
                </div>
            </div>
        )
    } else {
        selectedPersonDiv = (null)
    }

    return (
        <div className='form-field'>
            <label className='form-label'>{currentName}</label>
            <div tabIndex={0} onBlur={handleOnBlur} className='quick-result-box'>
                <input className='form-text-input' type='text' value={query} onChange={handleQueryChanged} onKeyDown={handleInputOnKeyDown} />
                {quickResult}
            </div>
            {selectedPersonDiv}
        </div>
    )
}