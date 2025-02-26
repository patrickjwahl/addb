import api from "@/client/API"
import { SchoolMetadata } from "@/shared/types/request"
import { FullState } from "@/shared/types/response"
import { Prisma } from "@prisma/client"
import { useEffect, useMemo, useState } from "react"

export default function SchoolPropertiesEdit({ school, callback }: { school?: Prisma.SchoolGetPayload<{ include: { region: true } }> | null, callback: (schoolId: number) => void }) {

    const [regionId, setRegionId] = useState(school?.regionId || -1)
    const [stateId, setStateId] = useState(school?.region?.stateId || -1)
    const [states, setStates] = useState<{ [id: number]: FullState }>({})
    const [name, setName] = useState(school?.name || '')
    const [fullName, setFullName] = useState(school?.fullName || '')
    const [city, setCity] = useState(school?.city || '')
    const [district, setDistrict] = useState(school?.district || '')
    const [validationError, setValidationError] = useState<string | null>(null)
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

    const validateInput = (): string | null => {
        if (!name) {
            return "Please enter the name."
        }
        if (regionId == -1) {
            return "Please select a state and region."
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

        const schoolMetadata: SchoolMetadata = {
            id: school?.id,
            name: name,
            regionId: regionId,
            city: city,
            district: district,
            fullName: fullName
        }

        const result = await api.upsertSchool(schoolMetadata)
        if (!result.success) {
            alert(result.message)
        } else {
            setMessage("Done :)")
            callback(result.data?.id || -1)
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
                <input style={{ width: 250 }} placeholder="Full Name" type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div className="edit-form-row">
                <select value={stateId} onChange={e => { setStateId(parseInt(e.target.value)); setRegionId(-1) }}>
                    <option value={-1} disabled hidden>State</option>
                    {
                        sortedStateIds.map(id => (
                            <option key={id} value={id}>{states[id].name}</option>
                        ))
                    }
                </select>
                <select value={regionId} onChange={e => setRegionId(parseInt(e.target.value))}>
                    <option value={-1} disabled hidden>Region</option>
                    {
                        states[stateId]?.regions.map(region => (
                            <option key={region.id} value={region.id}>{region.name}</option>
                        ))
                    }
                </select>
            </div>
            <div className="edit-form-row">
                <input type="text" placeholder="City" value={city || ''} onChange={e => setCity(e.target.value)} />
                <input type="text" placeholder="District" value={district || ''} onChange={e => setDistrict(e.target.value)} />
            </div>
            <div className="edit-form-row">
                <input type="text" placeholder="Short Name" value={name || ''} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ marginTop: '10px' }} className="edit-form-row">
                <input type="submit" value={!school ? "Create" : "Save"} />
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