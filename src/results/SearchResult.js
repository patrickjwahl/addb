import React, {Component} from 'react';
import qs from 'qs';
import '../styles.css';
import API from '../API';
import {Link} from 'react-router-dom';
import {Home} from '../Home';
import { roundMap } from '../util/consts';
import { Helmet } from 'react-helmet';

export class SearchResult extends Component {
    constructor(props) {
        super(props);
        this.state = {result: ''};
        this.performSearch = this.performSearch.bind(this);
    }

    performSearch() {
        let query = qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).query;
        if (!query) return;

        API.search(query)
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

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.location.search !== this.props.location.search) {
            this.performSearch();
        }
    }

    render() {
        let retval;

        let schoolResults = (null);
        let peopleResults = (null);
        let matchResults = (null);

        let resultsFound = false;

        if (!this.state.result && !this.props.location.search) {
            retval = <Home />
        } else if (!this.state.result) {
            retval = <div>Loading...</div>
        } else {
            if (this.state.result.data.schools.length > 0) {
                schoolResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>Schools</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.schools.map((school) => (
                                <Link to={`/school/${school._id}`} key={school._id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{school.fullName || school.name}</div>
                                        <div className='search-result-subtitle'>{school.city ? school.city + ', ' : ''}{school.state}</div>
                                    </li>
                                </Link>
                            ))
                        }
                        </ul>
                    </div>
                );
                resultsFound = true;
            }

            if (this.state.result.data.people.length > 0) {
                peopleResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>People</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.people.map((person) => (
                                <Link to={`/person/${person._id}`} key={person._id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{person.name}</div>
                                        <div className='search-result-subtitle'>{person.school + (person.city ? `, ${person.city}` : '') + (person.state ? `, ${person.state}` : '')}</div>
                                    </li>
                                </Link>
                            ))
                        }
                        </ul>
                    </div>
                );
                resultsFound = true;
            }

            if (this.state.result.data.matches.length > 0) {
                matchResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>Matches</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.matches.map((match) => (
                                <Link to={`/match/${match._id}`} key={match._id}>
                                    <li className='search-result'>
                                        <div className='search-result-title'>{match.year + ' ' + roundMap[match.round]}</div>
                                        <div className='search-result-subtitle'>{match.state} {match.region}</div>
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
                    <div className='search-result-list'>
                        {schoolResults}
                        {peopleResults}
                        {matchResults}
                    </div>
                );
            } else {
                retval = <div className='search-result-none'>No results found</div>;
            }
        }

        return (
            <div>
                <Helmet><title>{`Search for "${qs.parse(this.props.location.search, { ignoreQueryPrefix: true }).query}" | AcDecDB`}</title></Helmet>
                {retval}
            </div>
        )
    }
}