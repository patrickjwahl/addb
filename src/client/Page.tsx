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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import StudentCreatePage from './admin/StudentCreatePage'
import UserCreatePage from '@/client/admin/UserCreatePage'
import { FullState } from '@/shared/types/response'
import api from '@/client/API'
import Preferences from './Preferences'

export default function Page() {

    const [logoutFlip, setLogoutFlip] = useState(false)
    const [statesOpen, setStatesOpen] = useState(false)
    const [states, setStates] = useState<{ [id: number]: FullState }>({})

    const checkAuth = async () => {
        const result = await API.authenticate()
        if (!result.success) {
            API.logOut()
            setLogoutFlip(!logoutFlip)
        }
    }

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

    const loginCallback = useCallback(() => {
        setLogoutFlip(!logoutFlip)
    }, [logoutFlip])

    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        checkAuth()
        getStates()
    }, [])

    useEffect(() => {
        document.addEventListener('click', () => {
            setStatesOpen(false)
        })
    }, [])

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
                {API.accessLevel() == 4 && (<><Link to='/usercreate' className='page-link'>User Access Management</Link> {' ○ '}</>)}
                {/* <Link to='/editingguide' className='page-link'>Editing Guide</Link> */}
                {/* {' ○ '} */}
            </div>) : (null)} {API.canEdit() ? (<div style={{ display: 'inline' }}>
                <Link to='/edits' className='page-link'>Recent Edits</Link>
                {' ○ '}
            </div>) : (null)}
                <span className='page-link' onClick={() => {
                    API.logOut()
                    setLogoutFlip(!logoutFlip)
                }}>Log Out</span>
            </div>
        )
        : (
            <div style={{ display: 'inline' }} >
                <Link style={{ display: 'inline' }} state={{ from: location }} to='/login'>
                    <div className='page-link'>Log In</div>
                </Link>
                {' ○ '}
                <Link to='/register' className='page-link'>Register</Link>
            </div >
        )

    const Default = useMemo(() => {
        return () => {
            return (
                <div>
                    <h2 className='welcome'>The AcDec Database</h2>
                    <SearchContainer />
                </div>
            )
        }
    }, [logoutFlip])

    return (
        <div className='global' >
            <Helmet><title>AcDecDB | The world's #1 database for Academic Decathlon</title></Helmet>
            <div className='top-bar'>
                <Link to='/'>
                    <h1 className='header-main'>AD-DB</h1>
                </Link>
                <div className='menu-bar'>
                    <Link className='menu-bar-item' to="/nationals">Nationals</Link>
                    <div className='menu-bar-item menu-bar-states' onClick={e => { e.stopPropagation(); setStatesOpen(!statesOpen) }}>
                        States
                    </div>
                    {
                        statesOpen &&
                        <div className='menu-bar-states-dropdown' ref={dropdownRef} tabIndex={-1} onBlur={() => setStatesOpen(false)}>
                            {Object.values(states).map(state => state.name).sort().map(state => (
                                <Link key={state} className='menu-bar-item' to={`/state/${state.replaceAll(' ', '_')}`}>
                                    {state}
                                </Link>
                            ))}
                        </div>
                    }
                </div>
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
                    <Route path='/login' element={<Login />} />
                    <Route path='/preferences' element={<Preferences />} />
                    <Route path='/register' element={<Register loginCallback={loginCallback} />} />
                    <Route path='*' element={<Default />} />
                </Routes>
            </div>
            <div className='header-links'>
                {loginLink}
            </div>
        </div>
    )
}

