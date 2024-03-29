import React, {Component} from 'react';
import './styles.css';
import {Link, Switch, Route} from 'react-router-dom';
import {SearchContainer} from './results/SearchContainer';
import {MatchCreatePage} from './admin/MatchCreatePage';
import {PeopleMerger} from './admin/PeopleMerger';
import {PotentialMerges} from './admin/PotentialMerges';
import SchoolCreatePage from './admin/SchoolCreatePage';
import Login from './Login';
import API from './API';
import PrivateRoute from './PrivateRoute';
import CreateUser from './admin/CreateUser';
import Register from './Register';
import EditingGuide from './admin/EditingGuide';
import { Helmet } from 'react-helmet';
import tunes from './assets/audio/thedan.mp3';

export class Page extends Component {

    constructor(props) {
        super(props);
        this.state = { loggedInOnMount: false }
        this.audio = new Audio(tunes);
        this.playTunes = this.playTunes.bind(this);
    }

    componentDidMount() {
        API.authenticate().then(res => {
            this.forceUpdate();
        });
    }

    playTunes() {
        this.audio.play();
    }

    render() {
        let loginLink = !(!API.isLoggedIn() && !this.state.loggedInOnMount)
            ? (
                <div style={{display: 'inline'}}> <span>
                    Logged in as {API.username()} {' ○ '}
                </span>{API.canEdit() ? (<div style={{display: 'inline'}}>
                    <Link to='/matchcreate' className='page-link'>New Match</Link>
                    {' ○ '}
                    <Link to='/schoolcreate' className='page-link'>New School</Link>
                    {' ○ '}
                    <Link to='/peoplemerger' className='page-link'>PeopleMerger-9000</Link>
                    {' ○ '}
                    <Link to='/potentialmerges' className='page-link'>Merge Suggestions</Link>
                    {' ○ '}
                    <Link to='/editingguide' className='page-link'>Editing Guide</Link>
                    {' ○ '}
                     </div> ) : (null)} {API.accessLevel() === 4 ? (<div style={{display: 'inline'}}>
                        <Link to='/edits' className='page-link'>Recent Edits</Link>
                        {' ○ '}
                    </div>) : (null)}
                    <span className='page-link' onClick={() => {
                        API.logOut();
                        this.forceUpdate();
                    }}>Log Out</span> 
                </div>
            )
            : (
                <div style={{display:'inline'}} >
                    <span>&copy;2023 <a onClick={() => this.playTunes()} className='page-link' style={{display: 'inline'}}>Patrick J. Wahl</a></span>
                    {' ○ '}
                    <Link style={{display: 'inline'}} to={{pathname: '/login', state: {from: this.props.location}}}>
                        <div className='page-link'>Log In</div>
                    </Link>
                    {' ○ '}
                    <Link to='/register' className='page-link'>Register</Link>
                </div>
            );

        return(
            <div className='global'>
                <Helmet><title>AcDecDB | The world's #1 database for Academic Decathlon</title></Helmet>
                <div className='top-bar'>
                    <Link to='/'>
                        <h1 className='header-main'>AD-DB</h1>
                    </Link>
                </div>
                <div className='main-part'>
                <Switch>
                    <PrivateRoute exact path='/usercreate' component={CreateUser} req={4} />
                    <PrivateRoute exact path='/matchcreate' component={MatchCreatePage} req='edit' />
                    <PrivateRoute exact path='/schoolcreate' component={SchoolCreatePage} req='edit' />
                    <PrivateRoute exact path='/peoplemerger' component={PeopleMerger} req='edit' />
                    <PrivateRoute exact path='/editingguide' component={EditingGuide} req='edit' />
                    <PrivateRoute exact path='/potentialmerges' component={PotentialMerges} req='edit' />
                    <Route exact path='/login' component={Login} />
                    <Route exact path='/register' component={Register} />
                    <Route render={(props) => (
                        <div>
                            <h2 className='welcome'>The AcDec Database</h2>
                            <SearchContainer />
                        </div>
                    )} />
                </Switch>
                </div>
                <div className='header-links'>
                    {loginLink}
                </div>
            </div>
        );
    }
}

