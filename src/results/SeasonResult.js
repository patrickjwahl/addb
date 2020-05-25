import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import '../styles.css';
import API from '../API';
import Loader from 'react-loader-spinner';

const categories = {
    math: 'Math',
    music: 'Music',
    econ: 'Econ',
    science: 'Science',
    lit: 'Lit',
    art: 'Art',
    socialScience: 'Social Science',
    essay: 'Essay',
    speech: 'Speech',
    interview: 'Interview',
    objs: 'Objs',
    subs: 'Subs',
    overall: 'Overall'
};

const gpaToKey = {
    a: 'a',
    A: 'a',
    h: 'a',
    H: 'a',
    b: 'b',
    B: 'b',
    s: 'b',
    S: 'b',
    v: 'c',
    V: 'c',
    c: 'c',
    C: 'c'
};

const gpaToRank = {
    a: 1,
    A: 1,
    h: 1,
    H: 1,
    b: 2,
    B: 2,
    s: 2,
    S: 2,
    v: 3,
    V: 3,
    c: 3,
    C: 3
};

const possiblyShorten = str => {
    if (str.length > 20) {
        return str.slice(0, 16) + '...';
    }
    return str;
};

function toCamelCase(sentenceCase) {
    var out = "";
    sentenceCase.split(" ").forEach(function (el, idx) {
        var add = el.toLowerCase();
        out += (idx === 0 ? add : add[0].toUpperCase() + add.slice(1));
    });
    return out;
}

class SeasonResult extends Component {
    constructor(props) {
        super(props);
        this.state = {result: '', unsortedData: '', overallStudents: [], sortKey: 'team', sortReverse: true};
    }

    getSeason = () => {
        API.getSeason(this.props.match.params.schoolId, this.props.match.params.year)
        .then(res => {
            if (res.data === null) {
                this.setState({result: 'noresult'});
            } else {
                let unsortedStudents = {...res.data.rounds};
                Object.keys(res.data.rounds).forEach(round => {
                    res.data.rounds[round].students = res.data.rounds[round].students.sort((a, b) => {
                        let no1 = gpaToRank[a.gpa];
                        let no2 = gpaToRank[b.gpa];
                        return no1 - no2;
                    });
                    res.data.rounds[round].students = res.data.rounds[round].students.sort((a, b) => {
                        if (a.team === b.team) return 0;
                        let no1 = parseFloat(a.team);
                        let no2 = parseFloat(b.team);

                        let result = (no1 > no2) ? -1 : 1;
                        return result * -1;
                    });
                });
                this.setState({result: res, unsortedData: unsortedStudents, overallStudents: {...res.data.rounds}});
            }
        })
        .catch(err => {
            console.log(err);
            this.setState({result: 'noresult'});
        });
    };

    handleCategoryClicked = (label) => {
        let sortKey = toCamelCase(label);
        let shouldParse = false;
        if (['school', 'gpa', 'decathlete'].indexOf(sortKey) === -1) shouldParse = true;

        let sortReverse = this.state.sortReverse;
        if (sortKey === this.state.sortKey) {
            sortReverse = !sortReverse;
        } else {
            sortReverse = false;
        }

        let result = this.state.result;
        Object.keys(result.data.rounds).forEach(round => {
            result.data.rounds[round].students = result.data.rounds[round].students.sort((a, b) => {
                let no1 = shouldParse ? parseFloat(a[sortKey]) : a[sortKey];
                let no2 = shouldParse ? parseFloat(b[sortKey]) : b[sortKey];

                let result = (no1 > no2) ? -1 : 1;
                return sortReverse && no1 !== no2 ? result * -1 : result;
            });
        });
        this.setState({result, sortKey, sortReverse});
    };

    componentDidMount() {
        this.getSeason();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.schoolId !== prevProps.match.params.schoolId
            || this.props.match.params.year !== prevProps.match.params.year) {
            this.getSeason();
        }
    }

    render() {
        if (!this.state.result) {
            return <Loader
                type="TailSpin"
                height={40}
                width={40}
                timeout={10000}
                style={{marginTop: '50'}}
            />
        } else if (this.state.result === 'noresult') {
            return <div><h1>Couldn't load season.</h1></div>;
        } else {
            if (this.state.result.data) {
                let { rounds, teamNames, schoolName } = this.state.result.data;

                let createRound = (match) => {
                    if (!match) return (null);
                    let events = match.events;
                    let userHasAccess = API.accessLevel() >= match.access;

                    let roundName;
                    if (match.round === 'roundone') {
                        roundName = 'Round One';
                    } else if (match.round === 'regionals') {
                        roundName = 'Regionals';
                    } else if (match.round === 'state') {
                        roundName = 'State';
                    } else {
                        roundName = 'Nationals';
                    }

                    let headings = ['School', 'Team', 'GPA', 'Decathlete', 'Overall'];
                    if (events.math) {
                        headings.push(categories.math);
                    }
                    if (events.music) {
                        headings.push(categories.music);
                    }
                    if (events.econ) {
                        headings.push(categories.econ);
                    }
                    if (events.science) {
                        headings.push(categories.science);
                    }
                    if (events.lit) {
                        headings.push(categories.lit);
                    }
                    if (events.art) {
                        headings.push(categories.art);
                    }
                    if (events.socialScience) {
                        headings.push(categories.socialScience);
                    }
                    if (events.essay) {
                        headings.push(categories.essay);
                    }
                    if (events.speech) {
                        headings.push(categories.speech);
                    }
                    if (events.interview) {
                        headings.push(categories.interview);
                    }
                    if (events.objs) {
                        headings.push('Objs');
                    }
                    if (events.subs) {
                        headings.push('Subs');
                    }

                    let students = match.students;

                    let teamRows = {};
                    if (userHasAccess) {
                        let topScores = {};
                        teamNames.forEach(teamName => {
                            topScores[teamName] = Object.keys(categories).reduce((obj, cat) => {
                                obj[cat] = {
                                    a: {
                                        first: 0,
                                        second: 0
                                    },
                                    b: {
                                        first: 0,
                                        second: 0
                                    },
                                    c: {
                                        first: 0,
                                        second: 0
                                    }
                                };
                                return obj;
                            }, {});
                        });

                        let getTopScores = student => {
                            Object.keys(categories).forEach(cat => {
                                let studVal = parseFloat(student[cat]);
                                let studKey = gpaToKey[student.gpa];
                                let team = student.teamName;
                                if (studVal > topScores[team][cat][studKey].first) {
                                    topScores[team][cat][studKey].second = topScores[team][cat][studKey].first;
                                    topScores[team][cat][studKey].first = studVal;
                                } else if (studVal > topScores[team][cat][studKey].second) {
                                    topScores[team][cat][studKey].second = studVal;
                                }
                            });
                        };

                        students.forEach(student => {
                            getTopScores(student);
                        });

                        teamNames.forEach(teamName => {
                            let teamScores = topScores[teamName];
                            let catTotals = {};
                            Object.keys(categories).forEach(cat => {
                                let catTotal = teamScores[cat].a.first + teamScores[cat].a.second
                                + teamScores[cat].b.first + teamScores[cat].b.second
                                + teamScores[cat].c.first + teamScores[cat].c.second;
                                catTotals[cat] = catTotal;
                            });
    
                            teamRows[teamName] = (
                                <tr key={'total' + teamName} style={{fontWeight: 'bold', fontStyle: 'italic'}}>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td>Total</td>
                                    <td>{catTotals['overall'].toFixed(1)}</td>
                                    {(events.math) ? <td>{catTotals['math'].toFixed(1)}</td> : (null)}
                                    {(events.music) ? <td>{catTotals['music'].toFixed(1)}</td> : (null)}
                                    {(events.econ) ? <td>{catTotals['econ'].toFixed(1)}</td> : (null)}
                                    {(events.science) ? <td>{catTotals['science'].toFixed(1)}</td> : (null)}
                                    {(events.lit) ? <td>{catTotals['lit'].toFixed(1)}</td> : (null)}
                                    {(events.art) ? <td>{catTotals['art'].toFixed(1)}</td> : (null)}
                                    {(events.socialScience) ? <td>{catTotals['socialScience'].toFixed(1)}</td> : (null)}
                                    {(events.essay) ? <td>{catTotals['essay'].toFixed(1)}</td> : (null)}
                                    {(events.speech) ? <td>{catTotals['speech'].toFixed(1)}</td> : (null)}
                                    {(events.interview) ? <td>{catTotals['interview'].toFixed(1)}</td> : (null)}
                                    {(events.objs) ? <td>{catTotals['objs'].toFixed(1)}</td> : (null)}
                                    {(events.subs) ? <td>{catTotals['subs'].toFixed(1)}</td> : (null)}
                                </tr>
                            );
                        });

                        const largeCols = new Set(['School', 'Decathlete']);
                        const normalCols = new Set(['Team', 'GPA', 'Overall', 'Objs', 'Subs']);

                        const hasIndividualScores = students.filter(student => student.team).length > 0;

                        return (
                            <div key={match.round}>
                            {userHasAccess && hasIndividualScores > 0 ? (<div>
                                <div className='info-page-section'><Link to={`/match/${match._id}`}>{roundName}</Link><span style={{fontSize: 15, marginLeft: 5}}>(Rank {match.rank})</span></div>
                                <table className='info-page-table'>
                                <thead>
                                    <tr className='info-page-table-first-row'>
                                    {
                                        headings.map((text) => {
                                            let extraClass = '';
                                            if (largeCols.has(text)) {
                                                extraClass = ' table-cell-large';
                                            } else if (!normalCols.has(text)) {
                                                extraClass = ' table-cell-small';
                                            }
                                            return (
                                                <td className={'with-cursor' + extraClass} onClick={() => {this.handleCategoryClicked(text)}} key={text}>
                                                {text}{(toCamelCase(text) === this.state.sortKey) ? (this.state.sortReverse ? ' ▲' : ' ▼') : ''}
                                                </td>
                                            );
                                        })
                                    }
                                    </tr>
                                </thead>
                                <tbody>
                                {
                                    students.reduce((arr, student, index) => {
                                        let className = (index > 0 
                                            && (this.state.sortKey === 'school' || this.state.sortKey === 'team')
                                            && students[index-1].team !== student.team) ? 'separator-row' : '';
    
                                        let extraRow = ((index === students.length - 1) || index < students.length - 1
                                            && (this.state.sortKey === 'school' || this.state.sortKey === 'team')
                                            && students[index+1].team !== student.team) ? teamRows[student.teamName] : (null);
    
                                        let personLink = <Link to={`/person/${student.id}`}>{student.decathlete}</Link>;
                                        let teamLink = <Link to={`/school/${this.props.match.params.schoolId}`}>{possiblyShorten(student.teamName)}</Link>;
                                        if (student.team) arr = arr.concat((
                                            <tr className={className} key={index}>
                                                <td className='is-link table-cell-large'>{teamLink}</td>
                                                <td>{student.team}</td>
                                                <td>{student.gpa}</td>
                                                <td className='is-link table-cell-large'>{personLink}</td>
                                                <td className='bold'>{student.overall}</td>
                                                {(events.math) ? (<td data-tip="Math" className="table-cell-small">{student.math}</td>) : (null)}
                                                {(events.music) ? (<td data-tip="Music" className="table-cell-small">{student.music}</td>) : (null)}
                                                {(events.econ) ? (<td data-tip="Econ" className="table-cell-small">{student.econ}</td>) : (null)}
                                                {(events.science) ? (<td data-tip="Science" className="table-cell-small">{student.science}</td>) : (null)}
                                                {(events.lit) ? (<td data-tip="Literature" className="table-cell-small">{student.lit}</td>) : (null)}
                                                {(events.art) ? (<td data-tip="Art" className="table-cell-small">{student.art}</td>) : (null)}
                                                {(events.socialScience) ? (<td data-tip="Social Science" className="table-cell-small">{student.socialScience}</td>) : (null)}
                                                {(events.essay) ? (<td data-tip="Essay" className="table-cell-small">{student.essay}</td>) : (null)}	
                                                {(events.speech) ? (<td data-tip="Speech" className="table-cell-small">{student.speech}</td>) : (null)}
                                                {(events.interview) ? (<td data-tip="Interview" className="table-cell-small">{student.interview}</td>) : (null)}
                                                {(events.objs) ? (<td className='bold'>{student.objs}</td>) : (null)}
                                                {(events.subs) ? (<td>{student.subs}</td> ) : (null)}
                                            </tr> ));
                                        return arr.concat((extraRow));
                                    }, [])
                                }
                                </tbody>
                                </table>
                            </div>) : (null) }
                            {match.incompleteData || !userHasAccess ? (
                                <div>
                                    <div className='info-page-section'>{roundName}</div>
                                    <table className='info-page-table'>
                                    <thead>
        
                                        <tr className='info-page-table-first-row'>
                                            {['School', 'GPA', 'Decathlete', 'Overall'].map((text) => (
                                                <td className='with-cursor' key={text}>
                                                    {text}
                                                </td>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.overallStudents[match.round].reduce((arr, student, index) => {
                                        let personLink = <Link to={`/person/${student.id}`}>{student.decathlete}</Link>;
                                        let teamLink = <Link to={`/school/${this.props.match.params.schoolId}`}>{student.teamName}</Link>;
                                        arr = arr.concat((
                                            <tr key={index}>
                                                <td className='is-link table-cell-large'>{teamLink}</td>
                                                <td className='table-cell-large'>{student.gpa}</td>
                                                <td className='is-link table-cell-large'>{personLink}</td>
                                                <td className='bold table-cell-large'>{student.overall}</td>
                                            </tr>
                                        ))
                                        return arr;
                                    }, [])}
                                    </tbody>
                                    </table>
                                </div>
                            ): (null)}
                            </div>
                        );
                    }   
                };

                let tables = ['nationals', 'state', 'regionals', 'roundone'].map(r => createRound(rounds[r]));

                return (
                    <div className='info-page'>
                    <div className='small-header'>SEASON</div>
                    <div className='info-page-header'>
                        <div className='info-title'><Link to={`/school/${this.props.match.params.schoolId}`}>{schoolName}</Link></div>
                        <div className='info-subtite'>{this.props.match.params.year} Season</div>
                    </div>
                    {tables}
                    </div>
                );

            } else {
                return (null);
            }
        }
    } 
}

export default withRouter(SeasonResult);