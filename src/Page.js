import React, {Component} from 'react';
import './styles.css';
import {Link, Switch, Route} from 'react-router-dom';
import {SearchContainer} from './SearchContainer';
import {MatchCreatePage} from './MatchCreatePage';
import {PeopleMerger} from './PeopleMerger';
import SchoolCreatePage from './SchoolCreatePage';
import Login from './Login';
import API from './API';
import PrivateRoute from './PrivateRoute';
import CreateUser from './CreateUser';
import Register from './Register';

export class Page extends Component {
	render() {
		let loginLink = API.isLoggedIn()
			? (
				<div style={{display: 'inline'}}> <span>
					Logged in as {API.username()} {' ○ '}
				</span>{API.canEdit() ? (<div style={{display: 'inline'}}>
					<Link to='/matchcreate' className='page-link'>New Match</Link>
					{' ○ '}
					<Link to='/schoolcreate' className='page-link'>New School</Link>
					{' ○ '}
					<Link to='/peoplemerger' className='page-link'>PeopleMerger-9000</Link>
					{' ○ '} </div> ) : (null)} {API.accessLevel() === 4 ? (<div style={{display: 'inline'}}>
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
				<Link style={{display: 'inline'}} to={{pathname: '/login', state: {from: this.props.location}}}>
					<div className='page-link'>Log In</div>
				</Link>
				{' ○ '}
				<Link to='/register' className='page-link'>Register</Link>
				</div>
			);

		return(
			<div className='global'>
				<div className='top-bar'>
					<Link to='/'>
						<h1 className='header-main'>AD-DB</h1>
					</Link>
				</div>
				<div className='main-part'>
				<Switch>
					<Route exact path='/usercreate' component={CreateUser} />
					<PrivateRoute exact path='/matchcreate' component={MatchCreatePage} req='edit' />
					<PrivateRoute exact path='/schoolcreate' component={SchoolCreatePage} req='edit' />
					<PrivateRoute exact path='/peoplemerger' component={PeopleMerger} req='edit' />
					<Route exact path='/login' component={Login} />
					<Route exact path='/register' component={Register} />
					<Route render={(props) => (
						<div>
							<h2 className='welcome'>Welcome to the AD-DB!</h2>
							<SearchContainer />
						</div>
					)} />
				</Switch>
				</div>
				<div className='header-links'>
					© 2019 MassDecathlon ○ {loginLink}
				</div>
			</div>
		);
	}
}

