import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import SearchForm from './SearchForm';
import {SearchResult} from './SearchResult';
import {SchoolResult} from './SchoolResult';
import MatchResult from './MatchResult';

export class SearchContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {result: ''};
	}

	render() {
		return (
			<div className='search-container'>
				<SearchForm />
				<Switch>
					<Route exact path='/' render={(props) => (
						<Redirect to={{pathname: '/search'}} />
					)}/>
					<Route exact path='/search' render={(props) => (
						<SearchResult {...props} />
					)}/>
					<Route path='/school/:id' component={SchoolResult} />
					<Route path='/match/:id' component={MatchResult} />
				</Switch>
			</div>
		);
	}
}