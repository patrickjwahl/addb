import React, {Component} from 'react';
import './styles.css';
import {Link, Switch, Route} from 'react-router-dom';
import {SearchContainer} from './SearchContainer';
import {MatchCreatePage} from './MatchCreatePage';
import SchoolCreatePage from './SchoolCreatePage';

export class Page extends Component {
	render() {
		return(
			<div className='global'>
				<div className='top-bar'>
					<Link to='/'>
						<h1 className='header-main'>AD-DB</h1>
					</Link>
				</div>
				<Switch>
					<Route exact path='/matchcreate' component={MatchCreatePage} />
					<Route exact path='/schoolcreate' component={SchoolCreatePage} />
					<Route render={(props) => (
						<div>
							<h2 className='welcome'>Welcome to the AD-DB!</h2>
							<SearchContainer />
						</div>
					)} />
				</Switch>
			</div>
		);
	}
}

