import React, {Component} from 'react';
import API from '../API';
import {Link} from 'react-router-dom';

export class StatePage extends Component {
    constructor(props) {
        super(props);
        this.state = {result: ''};
        this.performSearch = this.performSearch.bind(this);
    }

    performSearch() {
        API.getStateResults(this.props.match.params.name)
        .then(res => {
            this.setState({result: res});
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    componentDidMount() {
        this.performSearch();
    }

    render() {
        let retval;

        let roundoneResults = (null);
        let regionalsResults = (null);
        let stateResults = (null);

        let resultsFound = false;

        if (!this.state.result) {
            retval = <div>Loading...</div>
        } else {
            if (this.state.result.data.matches.length > 0) {
                roundoneResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>Round One</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.matches.filter(match => match.round === 'roundone').map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result centered'>
                                        <div className='search-result-title'>{match.year} {match.round !== 'state' ? match.region : ''}</div>
                                        <div className='search-result-subtitle'>1. {match.first} - {match.firstScore}</div>
                                        <div className='search-result-subtitle'>2. {match.second} - {match.secondScore}</div>
                                        <div className='search-result-subtitle'>3. {match.third} - {match.thirdScore}</div>
                                    </li>
                                </Link>
                            ))
                        }
                        </ul>
                    </div>
                );
                regionalsResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>Regionals</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.matches.filter(match => match.round === 'regionals').map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result centered'>
                                        <div className='search-result-title'>{match.year} {match.round !== 'state' ? match.region : ''}</div>
                                        <div className='search-result-subtitle'>1. {match.first} - {match.firstScore}</div>
                                        <div className='search-result-subtitle'>2. {match.second} - {match.secondScore}</div>
                                        <div className='search-result-subtitle'>3. {match.third} - {match.thirdScore}</div>
                                    </li>
                                </Link>
                            ))
                        }
                        </ul>
                    </div>
                );
                stateResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>State</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.matches.filter(match => match.round === 'state').map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result centered'>
                                        <div className='search-result-title'>{match.year} {match.round !== 'state' ? match.region : ''}</div>
                                        <div className='search-result-subtitle'>1. {match.first} - {match.firstScore}</div>
                                        <div className='search-result-subtitle'>2. {match.second} - {match.secondScore}</div>
                                        <div className='search-result-subtitle'>3. {match.third} - {match.thirdScore}</div>
                                    </li>
                                </Link>
                            ))
                        }
                        </ul>
                    </div>
                );
                resultsFound = true;
            }

            if (resultsFound) {
                retval = (
                    <div style={{marginTop: 30}}>
                        <img src={require(`../assets/img/${this.props.match.params.name}.png`)} height={100} />
                        <h2 style={{color:'black', marginTop:10}}>{this.props.match.params.name.replace('_', ' ').toUpperCase()}</h2>
                        <div className='state-result-list'>
                            <div className='flex-column'>{stateResults}</div>
                            <div className='flex-column'>{regionalsResults}</div>
                            <div className='flex-column'>{roundoneResults}</div>
                        </div>
                    </div>
                );
            } else {
                retval = (
                    <div style={{marginTop: 30}}>
                        <img src={require(`../assets/img/${this.props.match.params.name}.png`)} height={100}/>
                        <h2 style={{color:'black', marginTop:10}}>{this.props.match.params.name.replace('_', ' ').toUpperCase()}</h2>
                        <div className='search-result-none'>No results found</div>
                    </div>
                );
            }
        }

        return retval;
    }

}