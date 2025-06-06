import PersonSelect from '@/client/admin/PersonSelect'
import API from '@/client/API'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useState } from 'react'
import { SearchResultStudent } from '@/shared/types/response'

export default function PeopleMerger() {

    const [god, setGod] = useState<SearchResultStudent | null>(null)
    const [peon, setPeon] = useState<SearchResultStudent | null>(null)

    const navigate = useNavigate()

    const selectGod = (info: SearchResultStudent) => {
        setGod(info)
    }

    const unselectGod = () => {
        setGod(null)
    }

    const selectPeon = (info: SearchResultStudent) => {
        setPeon(info)
    }

    const unselectPeon = () => {
        setPeon(null)
    }

    const submitMerge = async () => {
        if (!god || !peon) {
            alert('You gotta select some people ya dingus')
            return
        }
        const result = await API.mergePeople(god.id, peon.id)
        if (result.success) {
            navigate(`/student/${god.id}`)
        } else if (result.message) {
            alert(result.message)
        }
    }

    return (
        <div className='form-container'>
            <Helmet><title>PeopleMerger-9000 | AcDecDB</title></Helmet>
            <img src="/img/merge.jpg" width={150} style={{ margin: '10px 0' }} />
            <PersonSelect currentName={'God'} selectedPerson={god}
                selectPerson={selectGod} unselectPerson={unselectGod} />
            <PersonSelect currentName={'Peon'} selectedPerson={peon}
                selectPerson={selectPeon} unselectPerson={unselectPeon} />
            <button className='form-submit' type="button" onClick={submitMerge}>Merge</button>
        </div>
    )
}