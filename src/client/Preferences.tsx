import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { ShowMedalsOptions } from './results/MatchResult2'
import api from './API'
import { useNavigate } from 'react-router-dom'
import { ColorRing } from 'react-loader-spinner'
import { UserPreferencesInput } from '@/shared/types/request'

export default function Preferences() {

    const [loaded, setLoaded] = useState(false)
    const [gpaFilter, setGpaFilter] = useState('all')
    const [partitionBy, setPartitionBy] = useState<keyof ShowMedalsOptions>('overall')
    const [showMedals, setShowMedals] = useState(true)
    const [rankBy, setRankBy] = useState<keyof ShowMedalsOptions>('overall')
    const [saved, setSaved] = useState(false)

    const navigate = useNavigate()

    if (!api.isLoggedIn()) {
        navigate('/login')
    }

    const fetchPreferences = async () => {
        const prefs = await api.getPreferences()
        if (prefs.success && prefs.data) {
            setGpaFilter(prefs.data.gpa)
            setPartitionBy(prefs.data.partition as keyof ShowMedalsOptions)
            setShowMedals(prefs.data.medals)
            setRankBy(prefs.data.rank as keyof ShowMedalsOptions)
            setLoaded(true)
        }
    }

    useEffect(() => {
        fetchPreferences()
    }, [])

    if (!loaded) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    const savePreferences = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const input: UserPreferencesInput = {
            gpa: gpaFilter,
            partition: partitionBy,
            medals: showMedals,
            rank: rankBy
        }

        await api.setPreferences(input)
        setSaved(true)
        setTimeout(() => {
            setSaved(false)
        }, 5000)
    }

    return (
        <div>
            <Helmet><title>Preferences | AcDecDB</title></Helmet>
            <div className='form-container'>
                <h1>User Preferences</h1>
                <h3>Default Match Display</h3>
                <form className='preferences-form' onSubmit={savePreferences}>
                    <div>
                        <div className="title">Partition By</div>
                        <select value={partitionBy} onChange={e => setPartitionBy(e.target.value as keyof ShowMedalsOptions)}>
                            <option value={'overall'}>Overall</option>
                            <option value={'division'}>Division</option>
                            <option value={'gpa'}>GPA</option>
                            <option value="gpa_division">Division & GPA</option>
                        </select>
                    </div>
                    <div>
                        <div className="title">Filter by GPA</div>
                        <select value={gpaFilter} onChange={e => setGpaFilter(e.target.value)}>
                            <option value='all'>All</option>
                            <option value='H'>H</option>
                            <option value='S'>S</option>
                            <option value='V'>V</option>
                        </select>
                    </div>
                    <div>
                        <div className="title">Rank By</div>
                        <select value={rankBy} onChange={e => setRankBy(e.target.value as keyof ShowMedalsOptions)}>
                            <option value={'overall'}>Overall</option>
                            <option value={'division'}>Division</option>
                            <option value={'gpa'}>GPA</option>
                            <option value="gpa_division">Division & GPA</option>
                        </select>
                    </div>
                    <div>
                        <div className="title" onClick={() => setShowMedals(!showMedals)}>Show Medals</div>
                        <input type="checkbox" checked={showMedals} onChange={() => setShowMedals(!showMedals)} />
                    </div>
                    <input className='form-submit' type="submit" value="Save" />
                </form>
                {saved && <div>Preferences saved!</div>}
            </div>
        </div>
    )
}