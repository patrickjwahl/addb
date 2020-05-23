import React, {Component} from 'react';
import API from '../API';
import {Link} from 'react-router-dom';
import {StatePageYearDisplay} from './StatePageYearDisplay';

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
        
        let yearViews = [];

        let resultsFound = false;

        if (!this.state.result) {
            retval = <div>Loading...</div>
        } else {
            if (this.state.result.data.matches.length > 0) {
                resultsFound = true;

                let years = {};
                let matches = this.state.result.data.matches;
                matches.forEach(match => {
                    if (!(match.year in years)) {
                        years[match.year] = {
                            state: {_id: '', _scores: []},
                            regionals: {_scores: []},
                            roundone: {_scores: []}
                        }
                    }
                    if (match.round === 'state') {
                        years[match.year][match.round] = {
                            _id: match.id,
                            _scores: [[match.first, match.firstScore], [match.second, match.secondScore], [match.third, match.thirdScore]]
                        };
                    } else {
                        years[match.year][match.round][match.region] = {
                            _id: match.id,
                            _scores: [[match.first, match.firstScore], [match.second, match.secondScore], [match.third, match.thirdScore]]
                        };
                        years[match.year][match.round]._scores = years[match.year][match.round]._scores.concat([[match.first, match.firstScore], [match.second, match.secondScore], [match.third, match.thirdScore]]);
                    }
                });
                let sort_fn = (a, b) => {
                    let a_num = parseFloat(a[1].replace(/,/g, ""));
                    let b_num = parseFloat(b[1].replace(/,/g, ""));
                    return b_num - a_num;
                };
                let yearsList = [];
                for (let year in years) {
                    years[year].regionals._scores.sort(sort_fn);
                    years[year].roundone._scores.sort(sort_fn);
                    yearsList.push({year, data: years[year]});
                }
                yearsList.sort((a, b) => {
                    return parseInt(b.year) - parseInt(a.year);
                });
                console.log(yearsList);
                yearViews = yearsList.map(year => <StatePageYearDisplay data={year} key={year.year} />);
            }

            if (resultsFound) {
                retval = (
                    <div style={{marginTop: 30}}>
                    <div className='state-page-header'>
                        <img src={require(`../assets/img/${this.props.match.params.name}.png`)} height={50} />
                        <h2>{this.props.match.params.name.replace('_', ' ').toUpperCase()}</h2>
                        </div>
                        {yearViews}
                    </div>
                );
            } else {
                retval = (
                    <div style={{marginTop: 30}}>
                        <div className='state-page-header'>
                        <img src={require(`../assets/img/${this.props.match.params.name}.png`)} height={50}/>
                        <h2>{this.props.match.params.name.replace('_', ' ').toUpperCase()}</h2>
                        </div>
                        <div className='search-result-none'>No results found</div>
                    </div>
                );
            }
        }

        return retval;
    }

}