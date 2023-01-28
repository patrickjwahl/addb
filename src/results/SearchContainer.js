import React, {Component} from 'react';
import {Switch, Route, Redirect} from 'react-router-dom';
import SearchForm from './SearchForm';
import {SearchResult} from './SearchResult';
import {SchoolResult} from './SchoolResult';
import {PersonResult} from './PersonResult';
import MatchResult from './MatchResult';
import PrivateRoute from '../PrivateRoute';
import EditsPage from '../admin/EditsPage';
import {StatePage} from './StatePage';
import SeasonResult from './SeasonResult';

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
                    <PrivateRoute exact path='/edits' component={EditsPage} req={4} />
                    <Route exact path='/' render={(props) => (
                        <Redirect to={{pathname: '/search'}} />
                    )}/>
                    <Route exact path='/search' render={(props) => (
                        <SearchResult {...props} />
                    )}/>
                    <Route path='/school/:id' component={SchoolResult} />
                    <Route path='/person/:id' component={PersonResult} />
                    <Route exact path='/season/:schoolId/:year' component={SeasonResult} />
                    <Route exact path='/state/:name' component={StatePage} />
                    <Route path='/match/:id' render={props => (
                        <MatchResult {...props} specific={false} />
                    )} />
                    <Route exact path='/:round/:state/:year' render={props => (
                        <MatchResult {...props} specific={true} />
                    )} />
                    <Route path='/:round/:state/:region/:year' render={props => (
                        <MatchResult {...props} specific={true} />
                    )} />
                    <Route render={props => (
                        <h1>Uh-oh! There's no page here!</h1>
                    )} />
                </Switch>
            </div>
        );
    }
}