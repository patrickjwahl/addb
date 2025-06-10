import '@/client/styles.css'
import { Link, useParams } from 'react-router-dom'
import API from '@/client/API'
import { Helmet } from 'react-helmet'
import { ColorRing } from 'react-loader-spinner'
import { useEffect, useState } from 'react'
import api from '@/client/API'
import { StudentPage } from '@/shared/types/response'
import StudentPropertiesEdit from '@/client/components/edit/StudentPropertiesEdit'
import Table, { Column } from '@/client/components/table/Table'
import StudentYearRow from '@/client/components/table/StudentYearRow'

const tableCols: Column[] = ['Year', 'Round One', 'Regionals', 'State', 'Nationals'].map(name => ({
    name: name,
    sortingAllowed: false
}))

export default function PersonResult() {

    const [result, setResult] = useState<StudentPage | undefined | null>()
    const [notFound, setNotFound] = useState(false)
    const [editing, setEditing] = useState(false)
    const [deleted, setDeleted] = useState(false)

    const params = useParams()

    const getPerson = async () => {
        const result = await api.getStudent(parseInt(params.id || '0'))
        if (result.success) {
            setResult(result.data)
        } else {
            setNotFound(true)
        }
    }

    const toggleEditing = () => {
        setEditing(!editing)
    }

    const deletePerson = async () => {
        if (window.confirm('Do you truly mean this?')) {
            const result = await api.deleteStudent(parseInt(params.id || '0'))
            if (result.success) {
                setDeleted(true)
            } else {
                alert(result.message)
            }
        }
    }

    useEffect(() => {
        getPerson()
    }, [params.id])

    if (deleted) return <img src='/img/chigurh.jpg' />

    if (notFound) {
        return <div className='error-message'>Student not found.</div>
    }

    if (!result) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    if (result.student.id) {
        let seasonData
        if (Object.keys(result.seasons).length > 0) {
            seasonData = (
                <Table columns={tableCols}>
                    {Object.keys(result.seasons).map(Number).sort((a, b) => b - a).map(season => (
                        <StudentYearRow data={result.seasons[season]} year={season} key={season} />
                    ))}
                </Table>
            )
        } else {
            seasonData = <div className='search-result-none'>No season data yet!</div>
        }

        let subtitle = <div><Link style={{ display: 'inline', textDecoration: 'underline' }} to={`/school/${result.school?.id}`}>{result.school?.fullName || result.school?.name}</Link></div>
        let thirdTitle = (result.school?.city && result.school.state) ? `${result.school.city}, ${result.school.state.name}` : (result.school?.city || result.school?.state?.name || '')

        let editButtons
        if (!API.canEdit()) {
            editButtons = (null)
        } else {
            editButtons = (
                <div className='header-edit-buttons'>
                    <button className='admin-button' onClick={toggleEditing}>{editing ? 'Leave Editing Mode' : 'Edit'}</button>
                    <button className='admin-button' onClick={deletePerson}>Delete</button>
                </div>
            )
        }

        return (
            <div className='info-page'>
                <Helmet><title>{result.student.name} | AcDecDB</title></Helmet>
                <div className='small-header'>DECATHLETE</div>
                <div className='info-page-header'>
                    {
                        editing ? <StudentPropertiesEdit student={result.student} callback={getPerson} /> : (
                            <>
                                <div className='info-title'>{result.student.name}</div>
                                <div className='info-subtitle'>{subtitle}</div>
                                <div className='info-third-title'>{thirdTitle}</div>
                            </>
                        )
                    }
                    {editButtons}
                </div>
                <div className='info-page-section-header'>Match Results</div>
                {seasonData}
            </div>
        )
    }
}
