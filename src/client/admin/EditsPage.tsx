import { useEffect, useState } from 'react'
import API from '../API'
import { Helmet } from 'react-helmet'
import { EditResult } from '@/shared/types/response'

export default function EditsPage() {

    const [edits, setEdits] = useState<EditResult[]>([])

    let getEdits = async () => {
        const cursor = (edits.length > 0) ? edits[edits.length - 1].id : null
        const result = await API.getEdits(cursor)
        if (result.success && result.data) {
            setEdits([...edits, ...result.data])
        } else {
            alert(result.message)
        }
    }

    useEffect(() => {
        getEdits()
    }, [])

    return (
        <div className='info-page'>
            <Helmet><title>Recent Edits | AcDecDB</title></Helmet>
            <div>
                {edits.map(edit => (
                    <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '10px' }}>{new Date(edit.datetime).toLocaleDateString()} {new Date(edit.datetime).toLocaleTimeString()}</div>
                        {edit.summary}
                        {edit.diff && <div><pre>{edit.diff.replaceAll('},"', '},\n"')}</pre></div>}
                        <div style={{ fontSize: '12px' }}>[{edit.user.username}]</div>
                    </div>
                ))}
            </div>
            <button onClick={getEdits}>More</button>
        </div>
    )
}
