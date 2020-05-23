import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import '../styles.css';
import API from '../API';

var mouseDownHappened = false;
var intervalId = 0;

var possiblyShorten = str => {
    if (str.length > 37) {
        return str.slice(0, 50) + '...';
    }
    return str;
};

var roundMap = {
    roundone: 'Round One',
    regionals: 'Regionals',
    state: 'State',
    nationals: 'Nationals'
};

class SearchForm extends Component {
    constructor(props) {
        super(props);
        this.state = {query: '', result: '', focus: -1, quickResultNum: 0};
        this.handleQueryChanged = this.handleQueryChanged.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.clearQuickResult = this.clearQuickResult.bind(this);
        this.handleOnBlur = this.handleOnBlur.bind(this);
        this.handleInputOnKeyDown = this.handleInputOnKeyDown.bind(this);
        this.quickSearch = this.quickSearch.bind(this);
    }

    registerMouseDown(e) {
        mouseDownHappened = true;
    }

    clearQuickResult(e) {
        this.setState({result: ''});
    }

    quickSearch(newQuery) {
        return (function() {
            let query = newQuery;
            API.quickSearch(query)
            .then(res => {
                if (res.data.people.length + res.data.schools.length + res.data.matches.length > 0) {
                    this.setState({result: res, quickResultNum: (Math.min(res.data.people.length, 3) + Math.min(res.data.schools.length, 3) + Math.min(res.data.matches.length, 3))});
                } else {
                    this.setState({result: '', quickResultNum: 0});
                }
            })
            .catch(err => {
                console.log(err);
            });
        }).bind(this);
    }

    handleQueryChanged(e) {
        var query = e.target.value;
        clearTimeout(intervalId);
        if (query.length < 3) {
            this.setState({result: '', query: query});
            return;
        }
        this.setState({query: query});
        intervalId = setTimeout(this.quickSearch(query), 200);
    }

    handleOnBlur() {
        clearTimeout(intervalId);
        if (!mouseDownHappened) {
            this.setState({result: '', focus: -1});
        }
        mouseDownHappened = false;
    }

    handleSubmit(e) {
        e.preventDefault();
        if (this.state.query.length < 3) return;
        this.handleOnBlur();
        this.props.history.push(`/search?query=${this.state.query}`);
    }

    handleInputOnKeyDown(e) {
        if (this.state.result) {
            let keynum;
            if (window.event) {
                keynum = e.keyCode;
            } else {
                keynum = e.which;
            }

            if (keynum === 40) {
                let focus = this.state.focus;
                if (focus < this.state.quickResultNum - 1) {
                    this.setState({focus: focus + 1});
                    e.preventDefault();
                }
            } else if (keynum === 38) {
                let focus = this.state.focus;
                if (focus > -1) {
                    this.setState({focus: focus - 1});
                    e.preventDefault();
                }
            } else if (keynum === 13) {
                if (this.state.focus > -1) {
                    e.preventDefault();
                    this.handleOnBlur();
                    this.props.history.push(`/school/${this.state.result.data.schools[this.state.focus]._id}`);
                }
            } else {
                this.setState({focus: -1});
            }
        }
    }

    render() {

        let quickResult;
        let formClass;

        if (this.state.result) {
            formClass = 'search-input search-input-with-results';
            quickResult = (
                <ul className='quick-result-list'>
                {
                    this.state.result.data.schools.map((school, index) => {
                        if (index > 2) return (null);
                        let liClass;
                        if (index === this.state.focus) {
                            liClass = 'quick-result focus';
                        } else {
                            liClass = 'quick-result';
                        }
                        return (
                            <Link to={`/school/${school._id}`} key={school._id} onMouseDown={this.registerMouseDown} onClick={this.clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>School</div>
                                    <div className='quick-result-title'>{possiblyShorten(school.fullName || school.name)}</div>
                                    <div className='quick-result-subtitle'>{school.city ? school.city + (school.state ? ', ' : '') : ''}{school.state}</div>
                                </li>
                            </Link>
                        );
                    }).concat(this.state.result.data.people.map((person, index) => {
                        if (index > 2) return (null);
                        let liClass;
                        if (index === this.state.focus - Math.min(this.state.result.data.schools.length, 3)) {
                            liClass = 'quick-result focus';
                        } else {
                            liClass = 'quick-result';
                        }
                        return (
                            <Link to={`/person/${person._id}`} key={person._id} onMouseDown={this.registerMouseDown} onClick={this.clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>Decathlete</div>
                                    <div className='quick-result-title'>{possiblyShorten(person.name)}</div>
                                    <div className='quick-result-subtitle'>{person.school + (person.city ? `, ${person.city}` : '') + (person.state ? `, ${person.state}` : '')}</div>
                                </li>
                            </Link>
                        );
                    })).concat(this.state.result.data.matches.map((match, index) => {
                        if (index > 2) return (null);
                        let liClass;
                        if (index === this.state.focus - Math.min(this.state.result.data.schools.length, 3) - Math.min(this.state.result.data.people.length, 3)) {
                            liClass = 'quick-result focus';
                        } else {
                            liClass = 'quick-result';
                        }
                        return (
                            <Link to={`/match/${match._id}`} key={match._id} onMouseDown={this.registerMouseDown} onClick={this.clearQuickResult}>
                                <li className={liClass}>
                                    <div className='quick-result-type'>Match</div>
                                    <div className='quick-result-title'>{possiblyShorten(match.year + ' ' + roundMap[match.round])}</div>
                                    <div className='quick-result-subtitle'>{match.state} {match.region}</div>
                                </li>
                            </Link>
                        );
                    }))
                }
                </ul>
            );
        } else {
            formClass = 'search-input';
            quickResult = (null);
        }

        return (
            <div>
                <form className="search-form" onSubmit={this.handleSubmit}>
                    <div className='search-input-container' tabIndex='0' onBlur={this.handleOnBlur}>
                        <input className={formClass} placeholder="Look for schools, people, and matches" type="text" onChange={this.handleQueryChanged} value={this.state.query} onKeyDown={this.handleInputOnKeyDown} />
                        {quickResult}
                    </div>
                    <input className="search-submit" type="submit" value="Search" />
                </form>
            </div>
        );
    }
}

export default withRouter(SearchForm);