import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import '../styles.css';
import API from '../API';
import {SchoolSelect} from '../admin/SchoolSelect';
import {PersonSelect} from '../admin/PersonSelect';
import ReactTooltip from 'react-tooltip';
import Loader from 'react-loader-spinner'

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
}

const divisions = {
    L: 'Large Schools',
    M: 'Medium Schools',
    S: 'Small Schools',
    XS: 'Extra Small Schools',
    N: 'Novice Schools',
    1: 'Division I',
    2: 'Division II',
    3: 'Division III',
    4: 'Division IV',
    I: 'Division I',
    II: 'Division II',
    III: 'Division III',
    IV: 'Division IV',
    'Red': 'Red Division',
    'Blue': 'Blue Division',
    'White': 'White Division',
    'Nittany': 'Nittany',
    'Susquehanna': 'Susquehanna'
}

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
}

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
}

function toCamelCase(sentenceCase) {
    var out = "";
    sentenceCase.split(" ").forEach(function (el, idx) {
        var add = el.toLowerCase();
        out += (idx === 0 ? add : add[0].toUpperCase() + add.slice(1));
    });
    return out;
}

class MatchResult extends Component {
    constructor(props) {
        super(props);
        this.state = {result: '', unsortedData: '', overallStudents: [], overallSortKey: 'team', overallSortReverse: true, editedRows: {}, sortKey: 'team', sortReverse: true, edits: {}, teamEdits: {}, editedTeams: {}, editing: false, deleted: false, showDivisions: false};
        this.getMatch = this.getMatch.bind(this);
    }

    getMatch() {
        if (this.props.specific) {
            const {round, state, year, region} = this.props.match.params;
            API.getMatchSpecific(round, region, state, year)
            .then(res => {
                if (res.data === null) {
                    this.setState({result: 'noresult'});
                } else {
                    let unsortedStudents = [...res.data.students];
                    res.data.students = res.data.students.sort((a, b) => {
                        let no1 = gpaToRank[a.gpa];
                        let no2 = gpaToRank[b.gpa];
            
                        return no1 - no2;
                    });
                    res.data.students = res.data.students.sort((a, b) => {
                        if (a.team === b.team) return 0;
                        let no1 = parseFloat(a.team);
                        let no2 = parseFloat(b.team);
            
                        let result = (no1 > no2) ? -1 : 1;
                        return result * -1;
                    });
                    this.setState({result: res, unsortedData: unsortedStudents, overallStudents: [...res.data.students]});
                }
            })
            .catch(err => {
                this.setState({result: 'noresult'});
            });
        } else {
            API.getMatch(this.props.match.params.id)
            .then(res => {
                if (res.data === null) {
                    this.setState({result: 'noresult'});
                } else {
                    let unsortedStudents = [...res.data.students];
                    res.data.students = res.data.students.sort((a, b) => {
                        let no1 = gpaToRank[a.gpa];
                        let no2 = gpaToRank[b.gpa];

                        return no1 - no2;
                    });
                    res.data.students = res.data.students.sort((a, b) => {
                        if (a.team === b.team) return 0;
                        let no1 = parseFloat(a.team);
                        let no2 = parseFloat(b.team);

                        let result = (no1 > no2) ? -1 : 1;
                        return result * -1;
                    });
                    this.setState({result: res, unsortedData: unsortedStudents, overallStudents: [...res.data.students]});
                }
            })
            .catch(err => {
                console.log(err);
                this.setState({result: 'noresult'});
            });
        }
    }

    toggleEditing = () => {
        if (this.state.editing) this.getMatch();
        this.setState({editing: !this.state.editing, edits: {}, editedRows: {}, teamEdits: {}, editedTeams: {}});
    };

    toggleDivisions = () => {
        this.setState({showDivisions: !this.state.showDivisions});	
    };

    makeStudentRowEditable = (rowNum, student) => {
        let edits = this.state.edits;
        edits[rowNum] = {
            teamName: student.teamName,
            team: student.team,
            gpa: student.gpa,
            decathlete: student.decathlete,
            id: student.id,
            overall: student.overall,
            math: student.math,
            music: student.music,
            econ: student.econ,
            science: student.science,
            lit: student.lit,
            art: student.art,
            socialScience: student.socialScience,
            essay: student.essay,
            speech: student.speech,
            interview: student.interview,
            objs: student.objs,
            subs: student.subs,
            school: student.school,
            selectedPerson: {
                selectedName: '',
                selectedSchool: '',
                selectedFullSchool: ''
            }
        }
        this.setState({edits});
    };

    makeTeamRowEditable = (rowNum, team) => {
        let edits = this.state.teamEdits;
        edits[rowNum] = {
            id: team.id,
            selectedSchool: {
                selectedName: '',
                selectedCity: '',
                selectedState: '',
            },
            teamName: team.teamName,
            overall: team.overall,
            objs: team.objs,
            subs: team.subs,
            sq: team.sq
        };
        this.setState({teamEdits: edits});
    };

    selectSchool = info => {
        let index = info.id;
        let school = info.school;

        let edits = this.state.teamEdits;
        edits[index].id = school._id;
        edits[index].selectedSchool.selectedName = school.name;
        edits[index].selectedSchool.selectedCity = school.city;
        edits[index].selectedSchool.selectedState = school.state;
        this.setState({teamEdits: edits});
    };

    unselectSchool = index => {
        let edits = this.state.teamEdits;
        let origTeam = this.state.result.data.teams[index];
        edits[index].id = origTeam.id;
        edits[index].selectedSchool = {
            selectedName: '',
            selectedCity: '',
            selectedState: '',
        };
        this.setState({teamEdits: edits});
    };

    selectPerson = info => {
        let index = info.id;
        let person = info.person;

        let edits = this.state.edits;
        edits[index].id = person._id;
        edits[index].decathlete = person.name;
        edits[index].selectedPerson.selectedName = person.name;
        edits[index].selectedPerson.selectedSchool = person.school;
        edits[index].selectedPerson.selectedFullSchool = person.fullSchool;
        this.setState({edits: edits});
    };

    unselectPerson = index => {
        let edits = this.state.edits;
        let origStudent = this.state.result.data.students[index];
        edits[index].id = origStudent.id;
        edits[index].decathlete = origStudent.decathlete;
        edits[index].selectedPerson = {
            selectedName: '',
            selectedSchool: '',
            selectedFullSchool: ''
        };
        this.setState({edits: edits});
    };

    changeRowField = (rowNum, e) => {
        let edits = this.state.edits;
        edits[rowNum][e.target.name] = e.target.value;
        this.setState({edits});
    };
    
    changeTeamField = (rowNum, e) => {
        let edits = this.state.teamEdits;
        edits[rowNum][e.target.name] = e.target.value;
        this.setState({teamEdits: edits});
    };

    submitRowEdit = rowNum => {
        let edit = this.state.edits[rowNum];

        ['overall', 'math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview', 'objs', 'subs']
        .forEach(cat => {
            let numVal = Number(edit[cat]);
            if (isNaN(numVal)) {
                alert('Scores must be numbers!');
                return;
            }
            edit[cat] = numVal;
        });

        API.updateMatchStudent(this.state.result.data._id, rowNum, edit)
            .then(res => {
                if (res.data.success) {
                    let newEdits = {...this.state.edits};
                    delete newEdits[rowNum];
                    let editedRows = {...this.state.editedRows};
                    editedRows[rowNum] = true;
                    this.setState({edits: newEdits, editedRows: editedRows});
                } else {
                    alert('Something went wrong, Chief. Check the logs.');
                    console.log(res);
                }
            });
    };

    submitTeamEdit = rowNum => {
        let edit = this.state.teamEdits[rowNum];

        API.updateMatchTeam(this.state.result.data._id, rowNum, edit)
            .then(res => {
                if (res.data.success) {
                    let newEdits = {...this.state.teamEdits};
                    delete newEdits[rowNum];
                    let editedTeams = {...this.state.editedTeams};
                    editedTeams[rowNum] = true;
                    this.setState({teamEdits: newEdits, editedTeams: editedTeams});
                } else {
                    alert('Something went wrong, Chief. Check the logs.');
                    console.log(res);
                }
            });
    };

    getSchoolNameFromId = id => {
        let teams = this.state.result.data.teams;
        for (let i = 0; i < teams.length; i++) {
            if (teams[i].id === id) {
                return teams[i].school;
            }
        }
        return '';
    };

    handleCategoryClicked = label => {
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
        result.data.students = result.data.students.sort((a, b) => {
            let no1 = shouldParse ? parseFloat(a[sortKey]) : a[sortKey];
            let no2 = shouldParse ? parseFloat(b[sortKey]) : b[sortKey];

            let result = (no1 > no2) ? -1 : 1;
            return sortReverse && no1 !== no2 ? result * -1 : result;
        });
        this.setState({result, sortKey, sortReverse});
    }

    handleOverallCategoryClicked = label => {
        let sortKey = toCamelCase(label);
        let shouldParse = false;
        if (['school', 'gpa', 'decathlete'].indexOf(sortKey) === -1) shouldParse = true;

        let sortReverse = this.state.overallSortReverse;
        if (sortKey === this.state.overallSortKey) {
            sortReverse = !sortReverse;
        } else {
            sortReverse = false;
        }

        let students = this.state.overallStudents;
        let newStudents = students.sort((a, b) => {
            let no1 = shouldParse ? parseFloat(a[sortKey]) : a[sortKey];
            let no2 = shouldParse ? parseFloat(b[sortKey]) : b[sortKey];

            let result = (no1 > no2) ? -1 : 1;
            return sortReverse ? result * -1 : result;
        });
        this.setState({
            overallStudents: newStudents,
            overallSortKey: sortKey,
            overallSortReverse: sortReverse
        });
    }

    deleteMatch = () => {
        if (window.confirm('Are you suuuuure? This could mess some stuff up!')) {
            API.deleteMatch(this.state.result.data._id)
                .then(res => {
                    if (res.data.success) {
                        this.setState({deleted: true});
                    } else {
                        alert('Something went wrong, Chief. Check the logs.');
                    }
                });
        } else {
            alert('My disappointment is immeasureable and my day is ruined');
        }
    };

    componentDidMount() {
        this.getMatch();
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.match.params.id !== prevProps.match.params.id) {
            this.getMatch();
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
        } else if (this.state.deleted) {
            return <h3>Match deleted.</h3>;
        } else if (this.state.result === 'noresult') {
            return <div><h1>I'm so sowwy! Pwease fawgive me! UwU</h1><h1>I was unaboo to find the match!</h1></div>;
        } else {
            if (this.state.result.data) {
                let match = this.state.result.data;
                let events = match.events;

                let { editing, edits, teamEdits, showDivisions } = this.state;

                let userHasAccess = API.accessLevel() >= match.access;

                let urlSearch = this.props.location.search;
                let schoolFilter = undefined;
                if (urlSearch) {
                    let params = new URLSearchParams(urlSearch);
                    let schoolId = params.get('school');
                    if (schoolId) {
                        schoolFilter = this.getSchoolNameFromId(schoolId);
                    }
                }

                let roundName, subtitle;
                if (match.round === 'roundone') {
                    roundName = 'Round One';
                    subtitle = `${match.state} ${match.region}`;
                } else if (match.round === 'regionals') {
                    roundName = 'Regionals';
                    subtitle = `${match.state} ${match.region}`;
                } else if (match.round === 'state') {
                    roundName = 'State';
                    subtitle = match.state;
                } else {
                    roundName = 'Nationals';
                    subtitle = '';
                }

                let thirdTitle;
                if (match.date && match.site) {
                    thirdTitle = `${new Date(match.date).toLocaleDateString()} - ${match.site}`;
                } else if (match.date) {
                    thirdTitle = new Date(match.date).toLocaleDateString();
                } else if (match.site) {
                    thirdTitle = match.site;
                } else {
                    thirdTitle = '';
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

                let students = editing ? this.state.unsortedData : match.students;
                let teams = match.teams;

                let teamNameToId = {};
                teams.forEach(team => {
                    teamNameToId[team.teamName.trim()] = team.id;
                });

                let teamTables = (
                    <table className='info-page-table'>
                        <thead>
                            <tr className='info-page-table-first-row'>
                                <td>Rank</td>
                                <td>School</td>
                                <td>Overall</td>
                                {!match.incompleteData ? <td>Objs</td> : (null)}
                                {!match.incompleteData ? <td>Subs</td> : (null)}
                                {match.hasSq ? <td>Score w/ SQ</td> : (null)}
                            </tr>
                        </thead>
                        <tbody>
                        {
                            teams.map((team, index) => {
                                if (schoolFilter && team.school !== schoolFilter) return (null);
                                let className = '';
                                if (editing) {
                                    if (this.state.editedTeams[index]) {
                                        className = 'edited-row';
                                    }
                                }
                                if (teamEdits[index]) {
                                    return (
                                        <tr key={team.rank}>
                                            <td>{team.rank}</td>
                                            <td><div><SchoolSelect key={index} schoolname={team.school} selectId={index} 
                                                    selectedName={teamEdits[index].selectedSchool.selectedName} 
                                                    selectedCity={teamEdits[index].selectedSchool.selectedCity} 
                                                    selectedState={teamEdits[index].selectedSchool.selectedState} 
                                                    selectSchool={this.selectSchool} unselectSchool={this.unselectSchool} />
                                                </div><div><label>Team name: </label><input type = "text" size={30} name="teamName" value={teamEdits[index].teamName} onChange={e => {this.changeTeamField(index, e)}}/>

                                            </div></td>
                                            <td><input type="text" size={8} name="overall" value={teamEdits[index].overall} onChange={e => {this.changeTeamField(index, e)}}/></td>
                                            {!match.incompleteData ? <td><input type="text" size={8} name="objs" value={teamEdits[index].objs} onChange={e => {this.changeTeamField(index, e)}}/></td> : (null)}
                                            {!match.incompleteData ? <td><input type="text" size={8} name="subs" value={teamEdits[index].subs} onChange={e => {this.changeTeamField(index, e)}}/></td> : (null)}
                                            {match.hasSq ? <td><input type="text" size={8} name="sq" value={teamEdits[index].sq} onChange={e => {this.changeTeamField(index, e)}}/></td> : (null)}
                                            <td><button type="button" onClick={() => this.submitTeamEdit(index)}>Save</button></td>
                                        </tr>
                                    );
                                }
                                let schoolLink = !editing ? <Link to={`/school/${team.id}`}>{team.teamName}</Link> : team.teamName;
                                return (
                                    <tr className={className} key={team.rank}>
                                        <td>{team.rank}</td>
                                        <td className='is-link'>{schoolLink}</td>
                                        <td>{team.overall}</td>
                                        {!match.incompleteData ? <td>{team.objs}</td> : (null)}
                                        {!match.incompleteData ? <td>{team.subs}</td> : (null)}
                                        {match.hasSq ? <td>{team.sq}</td> : (null)}
                                        {(editing) ? (<td><button onClick={() => {this.makeTeamRowEditable(index, team)}}>Edit</button></td>) : (null)}
                                    </tr>
                                );
                            })
                        }
                    </tbody>
                    </table>
                );

                if (!editing && match.hasDivisions && showDivisions) {
                    let teamDivisions = teams.reduce((obje, team) => {
                        if (obje[team.division]) {
                            obje[team.division].push(team);
                        } else {
                            obje[team.division] = [team];
                        }
                        return obje;
                    }, {});

                    teamTables = Object.keys(teamDivisions).map(div => {
                        return (
                            <div>
                                <h3 className='info-page-subhead'>{divisions[div] || div}</h3>
                                <table className='info-page-table'>
                                <thead>
                                <tr className='info-page-table-first-row'>
                                    <td>Rank</td>
                                    <td>School</td>
                                    <td>Overall</td>
                                    {!match.incompleteData ? <td>Objs</td> : (null)}
                                    {!match.incompleteData ? <td>Subs</td> : (null)}
                                    {match.hasSq ? <td>Score w/ SQ</td> : (null)}
                                </tr>
                                </thead>
                                <tbody>
                                {
                                    teamDivisions[div].map((team, index) => {
                                        return (
                                            <tr key={team.rank}>
                                                <td>{index + 1}</td>
                                                <td className='is-link'><Link to={`/school/${team.id}`}>{team.teamName}</Link></td>
                                                <td>{team.overall}</td>
                                                {!match.incompleteData ? <td>{team.objs}</td> : (null)}
                                                {!match.incompleteData ? <td>{team.subs}</td> : (null)}
                                                {match.hasSq ? <td>{team.sq}</td> : (null)}
                                            </tr>
                                        );
                                    })
                                }
                                </tbody>
                                </table>
                            </div>
                        );
                    });	
                }

                let loggedIn = API.isLoggedIn();
                let canEdit = API.canEdit();
                let editButton = canEdit ? (
                    <div>
                        <button type="button" onClick={this.toggleEditing}>{editing ? 'Finish Editing' : 'Edit'}</button>
                        <button type="button" onClick={this.deleteMatch}>Delete</button>
                    </div>
                )
                 : (null);
                let showAllContent = schoolFilter
                    ? (<div>
                        <div>Showing results for {schoolFilter}.</div>
                        <div><Link className='page-link' to={this.props.location.pathname}>See all results</Link></div>
                       </div>
                    )
                    : (null);

                let teamRows = {};
                if (userHasAccess && !editing) {
                    let topScores = {};
                    teams.forEach(team => {
                        topScores[team.teamName] = Object.keys(categories).reduce((obj, cat) => {
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

                    teams.forEach(team => {
                        let teamScores = topScores[team.teamName];
                        let catTotals = {};
                        Object.keys(categories).forEach(cat => {
                            let catTotal = teamScores[cat].a.first + teamScores[cat].a.second
                            + teamScores[cat].b.first + teamScores[cat].b.second
                            + teamScores[cat].c.first + teamScores[cat].c.second;
                            catTotals[cat] = catTotal;
                        });

                        teamRows[team.teamName] = (
                            <tr key={'total' + team.teamName} style={{fontWeight: 'bold', fontStyle: 'italic'}}>
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
                }

                const largeCols = new Set(['School', 'Decathlete']);
                const normalCols = new Set(['Team', 'GPA', 'Overall', 'Objs', 'Subs']);

                const hasIndividualScores = students.filter(student => student.team).length > 0;

                return (
                    <div className='info-page'>
                        <ReactTooltip delayShow={250} />
                        <a name="#top"></a>
                        <div className='small-header'>MATCH</div>
                        <div className='info-page-header'>
                            <div className='info-title'>{match.year} {roundName}</div>
                            <div className='info-subtitle'>{subtitle}</div>
                            <div className='info-third-title'>{thirdTitle}</div>
                            {editButton}
                            {match.incompleteData ? <div><a className='page-link' href="#overalls">Jump to Overall Scores</a></div> : (null)}
                            <div><a className='page-link' href="#teamscores">Jump to Team Scores</a></div>
                        </div>
                        {showAllContent}
                        {userHasAccess && hasIndividualScores > 0 ? (<div>
                            <div className='info-page-section'>Individual Scores</div>
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
                                            <td className={'with-cursor' + extraClass} onClick={() => {if (!editing) this.handleCategoryClicked(text)}} key={text}>
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
                                    if (schoolFilter && student.school !== schoolFilter) return arr;
                                    let className = (index > 0 
                                        && (this.state.sortKey === 'school' || this.state.sortKey === 'team')
                                        && students[index-1].team !== student.team) ? 'separator-row' : '';

                                    let extraRow = ((index === students.length - 1) || index < students.length - 1
                                        && (this.state.sortKey === 'school' || this.state.sortKey === 'team')
                                        && students[index+1].team !== student.team) ? teamRows[student.teamName] : (null);

                                    if (editing) {
                                        if (this.state.editedRows[index]) {
                                            className = 'edited-row ' + className;
                                        }
                                    }
                                    if (edits[index]) {
                                        return arr.concat((
                                            <tr className={className} key={index}>
                                                <td>
                                                    <select type="select" name="teamName" value={edits[index].teamName} onChange={e => {this.changeRowField(index, e)}}>
                                                        {teams.map(team => (
                                                            <option key={team.rank} value={team.teamName}>{team.teamName}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td><input type="text" size={3} name="team" value={edits[index].team} onChange={e => {this.changeRowField(index, e)}}/></td>
                                                <td><input type="text" size={3} name="gpa" value={edits[index].gpa} onChange={e => {this.changeRowField(index, e)}}/></td>
                                                <td><PersonSelect personName={student.decathlete} selectId={index} 
                                                        selectedName={edits[index].selectedPerson.selectedName}
                                                        selectedSchool={edits[index].selectedPerson.selectedSchool}
                                                        selectedFullSchool={edits[index].selectedPerson.selectedFullSchool}
                                                        selectPerson={this.selectPerson} unselectPerson={this.unselectPerson} /></td>
                                                <td><input type="text" size={7} name="overall" value={edits[index].overall} onChange={e => {this.changeRowField(index, e)}}/></td>
                                                {(events.math) ? (<td><input type="text" size={6} name="math" value={edits[index].math} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.music) ? (<td><input type="text" size={6} name="music" value={edits[index].music} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.econ) ? (<td><input type="text" size={6} name="econ" value={edits[index].econ} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.science) ? (<td><input type="text" size={6} name="science" value={edits[index].science} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.lit) ? (<td><input type="text" size={6} name="lit" value={edits[index].lit} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.art) ? (<td><input type="text" size={6} name="art" value={edits[index].art} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.socialScience) ? (<td><input type="text" size={6} name="socialScience" value={edits[index].socialScience} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.essay) ? (<td><input type="text" size={6} name="essay" value={edits[index].essay} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.speech) ? (<td><input type="text" size={6} name="speech" value={edits[index].speech} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.interview) ? (<td><input type="text" size={6} name="interview" value={edits[index].interview} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.objs) ? (<td><input type="text" size={8} name="objs" value={edits[index].objs} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                {(events.subs) ? (<td><input type="text" size={8} name="subs" value={edits[index].subs} onChange={e => {this.changeRowField(index, e)}}/></td>) : (null)}
                                                <td><button type="button" onClick={() => this.submitRowEdit(index)}>Save</button></td>
                                            </tr>
                                        ));
                                    }
                                    let personLink = !editing ? <Link to={`/person/${student.id}`}>{student.decathlete}</Link> : student.decathlete;
                                    let teamLink = !editing ? <Link to={`/school/${teamNameToId[student.teamName.trim()]}`}>{student.teamName}</Link> : student.teamName;
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
                                            {(editing) ? (<td><button onClick={() => {this.makeStudentRowEditable(index, student)}}>Edit</button></td>) : (null)}
                                        </tr> ));
                                    return arr.concat((extraRow));
                                }, [])
                            }
                            </tbody>
                            </table>
                        </div>) : (null) }
                        {match.incompleteData || !userHasAccess ? (
                            <div>
                                <a name="overalls"></a>
                                <div className='info-page-section'>Overall Individual Scores <a className='page-link' style={{fontWeight: 'normal'}} href="#top">(Back to Top)</a></div>
                                <table className='info-page-table'>
                                <thead>
    
                                    <tr className='info-page-table-first-row'>
                                        {['School', 'GPA', 'Decathlete', 'Overall'].map((text) => (
                                            <td className='with-cursor' onClick={() => {this.handleOverallCategoryClicked(text)}} key={text}>
                                                {text}{(toCamelCase(text) === this.state.overallSortKey) ? (this.state.overallSortReverse ? ' ▲' : ' ▼') : ''}
                                            </td>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                {this.state.overallStudents.reduce((arr, student, index) => {
                                    if (schoolFilter && student.school !== schoolFilter) return arr;
                                    let personLink = !editing ? <Link to={`/person/${student.id}`}>{student.decathlete}</Link> : student.decathlete;
                                    let teamLink = !editing ? <Link to={`/school/${teamNameToId[student.teamName.trim()]}`}>{student.teamName}</Link> : student.teamName;
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
                        <a name="teamscores"></a>
                        <div className='info-page-section'>
                            Overall Team Scores <a className='page-link' style={{fontWeight: 'normal'}} href="#top">(Back to Top)</a>
                            {' '}{(schoolFilter || !match.hasDivisions ? (null) : <button type='button' className='divisions-button' onClick={this.toggleDivisions}>
                                {!this.state.showDivisions ? 'Show by Division' : 'Show Overall'}
                            </button>)}
                        </div>
                        {
                            teamTables
                        }
                    </div>
                );
            } else {
                return (null);
            }
        }
    }

}

export default withRouter(MatchResult);