import '@/client/styles.css'
import { Link, Route, useLocation, Routes } from 'react-router-dom'
import SearchContainer from '@/client/results/SearchContainer'
import MatchCreatePage from '@/client/admin/MatchCreatePage'
import PeopleMerger from '@/client/admin/PeopleMerger'
import PotentialMerges from '@/client/admin/PotentialMerges'
import SchoolCreatePage from '@/client/admin/SchoolCreatePage'
import Login from '@/client/Login'
import API from '@/client/API'
import Register from '@/client/Register'
import EditingGuide from '@/client/admin/EditingGuide'
import { Helmet } from 'react-helmet'
import tunes from './assets/audio/thedan.mp3'
import { useMemo, useState } from 'react'
import StudentCreatePage from './admin/StudentCreatePage'
import UserCreatePage from '@/client/admin/UserCreatePage'

export default function Page() {

    const [logoutFlip, setlogoutFlip] = useState(false)

    const audio = useMemo(() => {
        return new Audio(tunes)
    }, [])

    const playTunes = () => {
        audio.play()
    }

    const location = useLocation()

    let loginLink = !(!API.isLoggedIn())
        ? (
            <div style={{ display: 'inline' }}> <span>
                Logged in as {API.username()} {' ○ '}
            </span>{API.canEdit() ? (<div style={{ display: 'inline' }}>
                <Link to='/matchcreate' className='page-link'>New Match</Link>
                {' ○ '}
                <Link to='/schoolcreate' className='page-link'>New School</Link>
                {' ○ '}
                <Link to='/studentcreate' className='page-link'>New Student</Link>
                {' ○ '}
                <Link to='/peoplemerger' className='page-link'>PeopleMerger-9000</Link>
                {' ○ '}
                <Link to='/potentialmerges' className='page-link'>Merge Suggestions</Link>
                {' ○ '}
                {API.accessLevel() == 4 && (<><Link to='/usercreate' className='page-link'>New User</Link> {' ○ '}</>)}
                <Link to='/editingguide' className='page-link'>Editing Guide</Link>
                {' ○ '}
            </div>) : (null)} {API.canEdit() ? (<div style={{ display: 'inline' }}>
                <Link to='/edits' className='page-link'>Recent Edits</Link>
                {' ○ '}
            </div>) : (null)}
                <span className='page-link' onClick={() => {
                    API.logOut()
                    setlogoutFlip(!logoutFlip)
                }}>Log Out</span>
            </div>
        )
        : (
            <div style={{ display: 'inline' }} >
                <span>&copy;2023 <a onClick={() => playTunes()} className='page-link' style={{ display: 'inline' }}>Patrick J. Wahl</a></span>
                {' ○ '}
                <Link style={{ display: 'inline' }} state={{ from: location }} to='/login'>
                    <div className='page-link'>Log In</div>
                </Link>
                {' ○ '}
                <Link to='/register' className='page-link'>Register</Link>
            </div >
        )

    const Default = () => {
        return (
            <div>
                <h2 className='welcome'>The AcDec Database</h2>
                <SearchContainer />
            </div>
        )
    }

    return (
        <div className='global' >
            <Helmet><title>AcDecDB | The world's #1 database for Academic Decathlon</title></Helmet>
            <div className='top-bar'>
                <Link to='/'>
                    <h1 className='header-main'>AD-DB</h1>
                </Link>
            </div>
            <div className='main-part'>
                <Routes>
                    <Route path='/usercreate' element={<UserCreatePage />} />
                    <Route path='/matchcreate' element={<MatchCreatePage />} />
                    <Route path='/schoolcreate' element={<SchoolCreatePage />} />
                    <Route path='/studentcreate' element={<StudentCreatePage />} />
                    <Route path='/peoplemerger' element={<PeopleMerger />} />
                    <Route path='/editingguide' element={<EditingGuide />} />
                    <Route path='/potentialmerges' element={<PotentialMerges />} />
                    <Route path='login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='*' element={<Default />} />
                </Routes>
            </div>
            <div className='header-links'>
                {loginLink}
            </div>
        </div>
    )
}

