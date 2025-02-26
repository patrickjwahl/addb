import API from '@/client/API'
import { MergeSuggestion } from '@/shared/types/response'
import { stateNames } from '@/shared/util/consts'
import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function PotentialMerges() {

    const [state, setState] = useState(stateNames[0])
    const [suggestions, setSuggestions] = useState<MergeSuggestion[]>([])

    const handleStateChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setState(e.target.value)
    }

    const getSuggestions = async () => {
        const result = await API.getPotentialMerges(state)
        if (result.success && result.data) {
            const potentialMerges = result.data
            let seenCombosString = localStorage.getItem('seenCombos') || '[]'
            let seenCombos = new Set(JSON.parse(seenCombosString))
            potentialMerges.forEach(suggestion => {
                if (seenCombos.has(`${suggestion.teamName},${suggestion.student1.id},${suggestion.student2.id}`)) {
                    suggestion.seen = true
                } else {
                    suggestion.seen = false
                }
            })
            setSuggestions(potentialMerges)
        }
    }

    const markAsSeen = (index: number) => {
        let newSuggestions = [...suggestions]
        let suggestionToMark = newSuggestions[index]
        suggestionToMark.seen = true
        let seenCombos = new Set()
        newSuggestions.filter(suggestion => suggestion.seen).forEach(suggestion => {
            seenCombos.add(`${suggestion.teamName},${suggestion.student1.id},${suggestion.student2.id}`)
        })
        let seenCombosString = JSON.stringify(Array.from(seenCombos))
        localStorage.setItem('seenCombos', seenCombosString)

        newSuggestions[index] = suggestionToMark
        setSuggestions(newSuggestions)
    }

    return (
        <div style={{ width: '50%', marginLeft: 20, color: 'black' }}>
            <select id='state' onChange={handleStateChanged} value={state}>
                {
                    stateNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))
                }
            </select>
            <button style={{ marginLeft: 5, marginBottom: 10 }} onClick={getSuggestions}>Get Potential Merges</button>
            {
                suggestions.map((suggestion, index) => (
                    <div key={index} style={{ marginBottom: 5, color: suggestion.seen ? 'red' : 'black' }}>
                        <span><b>{suggestion.teamName}:</b> <Link style={{ textDecoration: 'underline', display: 'inline' }} target='_blank' to={`/student/${suggestion.student1.id}`}>{suggestion.student1.name}</Link>, <Link style={{ textDecoration: 'underline', display: 'inline' }} target='_blank' to={`/student/${suggestion.student2.id}`}>{suggestion.student2.name}</Link></span>
                        <button style={{ marginLeft: 10 }} onClick={() => markAsSeen(index)}>Mark as Seen</button>
                    </div>
                ))
            }
        </div>
    )
}