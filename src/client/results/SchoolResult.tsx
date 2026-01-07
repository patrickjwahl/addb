import '@/client/styles.css'
import { Link, useParams } from 'react-router-dom'
import API from '@/client/API'
import { Helmet } from 'react-helmet'
import { ColorRing } from 'react-loader-spinner'
import { useEffect, useState, JSX } from 'react'
import { SchoolPage } from '@/shared/types/response'
import TeamYearRow from '@/client/components/table/TeamYearRow'
import Table, { Column } from '@/client/components/table/Table'
import SchoolPropertiesEdit from '@/client/components/edit/SchoolPropertiesEdit'
import api from '@/client/API'

const teamResultCols: Column[] = ['Year', 'Round One', 'Regionals', 'State', 'Nationals'].map(name => ({
    name: name,
    sortingAllowed: false
}))

export default function SchoolResult() {

    const [result, setResult] = useState<SchoolPage | undefined | null>()
    const [editing, setEditing] = useState(false)
    const [rostersOpen, setRostersOpen] = useState<{ [year: number]: boolean }>({})
    const [deleted, setDeleted] = useState(false)

    const params = useParams()

    const getSchool = async () => {
        const result = await API.getSchool(parseInt(params.id || '0'))
        if (result.success) {
            setResult(result.data)
        } else {
            alert("Couldn't find school")
        }
    }

    const toggleEdit = () => {
        setEditing(!editing)
    }

    const deleteSchool = async () => {
        if (window.confirm('Do you truly mean this?')) {
            const result = await api.deleteSchool(parseInt(params.id || '0'))
            if (result.success) {
                setDeleted(true)
            } else {
                alert(result.message)
            }
        }
    }

    const handleRosterYearClicked = (year: number) => {
        if (!(year in rostersOpen)) {
            setRostersOpen({ ...rostersOpen, [year]: true })
        } else {
            setRostersOpen({ ...rostersOpen, [year]: !rostersOpen[year] })
        }
    }

    useEffect(() => {
        getSchool()
    }, [params.id])

    if (!result) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    if (deleted) return <img src='/img/chigurh.jpg' />

    if (result.school) {
        let school = result.school
        let teamData = null
        let makeRoster = (year: number) => {
            return (
                <div key={year} className='roster-container'>
                    <div className={'roster-link' + (rostersOpen[year] ? ' roster-link-open' : '')} onClick={() => handleRosterYearClicked(year)}>{year}</div>
                    <ul className={!rostersOpen[year] ? 'roster-closed' : ''}>
                        {result.rosters[year] && result.rosters[year].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })).map(student => {
                            return <li key={student.id}><Link to={`/student/${student.id}`}>{student.name}</Link></li>
                        })}
                    </ul>
                </div>
            )
        }

        let teamRows: { [name: string]: JSX.Element[] } = {}
        result.teams.forEach(team => {
            teamRows[team.team.name] = Object.keys(team.seasons).map(Number).sort((a, b) => b - a).map((year: number) => (
                <TeamYearRow schoolId={result.school.id} data={team.seasons[year]} year={year} key={year} />
            ))
        })

        if (result.teams.length > 0) {
            teamData = (
                <div>
                    <div className='info-page-section-header'>Match Results</div>
                    {Object.keys(teamRows).filter(teamName => teamRows[teamName].length > 0).sort().map(teamName => (
                        <div key={teamName}>
                            <div className='info-page-subsection'>{teamName}</div>
                            <Table columns={teamResultCols}>
                                {teamRows[teamName]}
                            </Table>
                        </div>
                    ))}
                    <div className='info-page-section-header'>Rosters</div>
                    {Object.keys(result.rosters).map(Number).sort((a, b) => b - a).map(year => {
                        return makeRoster(year)
                    })}
                </div>
            )
        } else {
            teamData = <div className='search-result-none'>No season data yet!</div>
        }

        let title
        if (school.fullName) {
            title = school.fullName
        } else {
            title = school.name
        }

        let subtitle
        if (school.city && school.state) {
            subtitle = `${school.city}, ${school.state.name}`
        } else {
            subtitle = `${school.city || ''}${school.state?.name || ''}`
        }

        let thirdTitle
        if (school.district && school.region) {
            thirdTitle = `${school.district}, ${school.region.name}`
        } else {
            thirdTitle = `${school.district || ''}${school.region?.name || ''}`
        }

        let editButtons
        if (!API.canEdit()) {
            editButtons = (null)
        } else {
            editButtons = (
                <div className='header-edit-buttons'>
                    <button className='admin-button' onClick={toggleEdit}>{editing ? 'Leave Editing Mode' : 'Edit'}</button>
                    <button className='admin-button' onClick={deleteSchool}>Delete</button>
                </div>
            )
        }

        return (
            <div className='info-page'>
                <Helmet><title>{title} | AcDecDB</title></Helmet>
                <div className='small-header'>SCHOOL</div>
                <div className='info-page-header'>
                    {editing ? <SchoolPropertiesEdit school={result.school} callback={getSchool} /> : (<>
                        <div className='info-title'>{title}</div>
                        <div className='info-subtitle'>{subtitle}</div>
                        <div className='info-third-title'>{thirdTitle}</div>
                    </>)}
                    {editButtons}
                </div>
                {teamData}
            </div>
        )
    }
}
