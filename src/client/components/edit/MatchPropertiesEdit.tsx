import api from "@/client/API"
import { MatchMetadata } from "@/shared/types/request"
import { FullState, Match } from "@/shared/types/response"
import { friendlyRound, roundOrder, objs, subs, friendlyColumn, eventOrdering } from "@/shared/util/consts"
import { Category, Round } from "@prisma/client"
import { useEffect, useMemo, useState } from "react"

export default function MatchPropertiesEdit({ match, callback }: { match: Match, callback: (matchId: number) => void }) {

    const [year, setYear] = useState(match?.year.toString() || new Date().getFullYear().toString())
    const [yearNum, setYearNum] = useState(parseInt(match?.year.toString() || new Date().getFullYear().toString()) || new Date().getFullYear())
    const [round, setRound] = useState(match?.round || 'null')
    const [stateId, setStateId] = useState(match?.stateId || -1)
    const [regionId, setRegionId] = useState<'_new' | number>(match?.regionId || -1)
    const [states, setStates] = useState<{ [id: number]: FullState }>({})
    const [date, setDate] = useState(match && new Date(match?.date).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric', day: 'numeric' }) || '')
    const [site, setSite] = useState(match?.site)
    const [events, setEvents] = useState(!match ? new Set(eventOrdering(parseInt(year) || 2025)) : new Set(match?.events))
    const [access, setAccess] = useState(match?.access || 1)
    const [hasDivisions, setHasDivisions] = useState(match?.hasDivisions || false)
    const [hasSq, setHasSq] = useState(match?.hasSq || false)
    const [note, setNote] = useState(match?.note || '')
    const [validationError, setValidationError] = useState<string | null>(null)
    const [newRegion, setNewRegion] = useState('')
    const [message, setMessage] = useState<string | null>(null)

    const getStates = async () => {
        const states = await api.getStates()
        if (!states.success) {
            alert('Error! ' + states.message)
        } else {
            const mappedStates = states?.data?.reduce((prev, state) => {
                return { ...prev, [state.id]: state }
            }, {})

            mappedStates && setStates(mappedStates)
        }
    }

    useEffect(() => {
        getStates()
    }, [])

    const changeRegion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value == '_new') {
            setRegionId('_new')
        } else {
            setRegionId(parseInt(e.target.value))
        }
    }

    const updateEvents = () => {
        setYearNum(parseInt(year))
        setEvents(new Set(eventOrdering(parseInt(year) || 2025)))
    }

    const validateInput = (): string | null => {
        if (!year || parseInt(year) < 0) {
            return "Please enter a valid year."
        }
        if (round == 'null') {
            return "Please select a round."
        }
        if (round != 'nationals' && stateId == -1) {
            return "Please select a state."
        }
        if (round != 'nationals' && round != 'state' && (regionId == -1 || regionId == '_new' && !newRegion)) {
            return "Please select a region."
        }
        if (isNaN(new Date(date).valueOf())) {
            return "Please enter a valid date."
        }
        if (events.size == 0) {
            return "Please select at least one event."
        }

        return null
    }

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setValidationError(null)
        const err = validateInput()
        if (err) {
            setValidationError(err)
            return
        }
        let filteredEvents = objs(yearNum).filter(o => events.has(o))
        filteredEvents = filteredEvents.concat(subs.filter(s => events.has(s)))
        const matchMetadata: MatchMetadata = {
            year: parseInt(year),
            round: round as Round,
            date: new Date(date),
            site: site ? site : null,
            events: filteredEvents,
            access,
            hasDivisions,
            hasSq,
            id: match?.id,
            note: note || null
        }
        stateId >= 0 && (matchMetadata.stateId = stateId)
        regionId != '_new' && regionId >= 0 && (matchMetadata.regionId = regionId)
        regionId == '_new' && (matchMetadata.newRegion = newRegion)

        const result = await api.upsertMatch(matchMetadata)
        if (!result.success) {
            alert(result.message)
        } else {
            setMessage("Done :)")
            callback(result.data || -1)
        }
    }

    const handleEventChecked = (event: Category, checked: boolean) => {
        if (checked) {
            let newEvents = new Set(events)
            newEvents.add(event)
            setEvents(newEvents)
        } else {
            let newEvents = new Set(events)
            newEvents.delete(event)
            setEvents(newEvents)
        }
    }

    const sortedStateIds = useMemo(() => {
        const keys = Object.keys(states).map(k => parseInt(k))
        const sortedKeys = keys.sort((a, b) => states[a].name.localeCompare(states[b].name))
        return sortedKeys
    }, [states])

    return (
        <form className="edit-form" onSubmit={submitForm}>
            <div className="edit-form-row">
                <input style={{ width: '4em' }} placeholder="Year" type="number" value={year} onChange={e => setYear(e.target.value)} onBlur={updateEvents} />
                <select value={round} onChange={e => setRound(e.target.value as Round)}>
                    <option value="null" disabled hidden>Round</option>
                    {
                        roundOrder.map(r => {
                            return <option key={r} value={r}>{friendlyRound[r]}</option>
                        })
                    }
                </select>
            </div>
            {round !== 'nationals' && (
                <div className="edit-form-row">
                    <select value={stateId} onChange={e => { setStateId(parseInt(e.target.value)); setRegionId(-1) }}>
                        <option value={-1} disabled hidden>State</option>
                        {
                            sortedStateIds.map(id => (
                                <option key={id} value={id}>{states[id].name}</option>
                            ))
                        }
                    </select>
                    {round !== 'state' && (
                        <>
                            <select value={regionId} onChange={changeRegion}>
                                <option value={-1} disabled hidden>Region</option>
                                {
                                    states[stateId]?.regions.map(region => (
                                        <option key={region.id} value={region.id}>{region.name}</option>
                                    ))
                                }
                                <option value={'_new'}>New Region</option>
                            </select>
                            {
                                regionId == '_new' && <div className="edit-form-row">
                                    <input placeholder="Region name" type="text" value={newRegion} onChange={e => setNewRegion(e.target.value)} />
                                </div>
                            }
                        </>
                    )}
                </div>
            )}
            <div className="edit-form-row">
                <input type="text" placeholder="Date" value={date || ''} onChange={e => setDate(e.target.value)} />
                <input type="text" placeholder="Venue" value={site || ''} onChange={e => setSite(e.target.value)} />
            </div>
            <div className="edit-form-row">
                {
                    objs(yearNum).map(category => (
                        <label key={category}>
                            {friendlyColumn[category]}
                            <input type="checkbox" checked={events.has(category)} onChange={e => handleEventChecked(category, e.target.checked)} />
                        </label>
                    ))
                }
            </div>
            <div className="edit-form-row">
                {
                    subs.map(category => (
                        <label key={category}>
                            {friendlyColumn[category]}
                            <input type="checkbox" checked={events.has(category)} onChange={e => handleEventChecked(category, e.target.checked)} />
                        </label>
                    ))
                }
            </div>
            <div className="edit-form-row">
                <select value={access} onChange={e => setAccess(parseInt(e.target.value))}>
                    <option value={1}>Public</option>
                    <option value={2}>Low Ind. Scores Hidden</option>
                    <option value={3}>All Ind. Scores Hidden</option>
                </select>
                <label>
                    Divisions?
                    <input type="checkbox" checked={hasDivisions} onChange={e => setHasDivisions(e.target.checked)} />
                </label>
                <label>
                    SQ?
                    <input type="checkbox" checked={hasSq} onChange={e => setHasSq(e.target.checked)} />
                </label>
            </div>
            <div className="edit-form-row">
                <textarea placeholder="Notes..." value={note} onChange={e => setNote(e.target.value)}></textarea>
            </div>
            <div style={{ marginTop: '10px' }} className="edit-form-row">
                <input type="submit" value={!match ? "Create" : "Save Match Info"} />
            </div>
            {validationError && (
                <div className="edit-form-row">
                    <span className="validation-error">{validationError}</span>
                </div>
            )}
            {message && (
                <div className="edit-form-row">
                    <span className="edit-form-message">{message}</span>
                </div>
            )}
        </form>
    )
}