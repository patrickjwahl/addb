import React, {Component} from 'react';
import {SchoolSelect} from './SchoolSelect';
import { Link } from 'react-router-dom';
import '../styles.css';
import API from '../API';
import { Helmet } from 'react-helmet';

export class SchoolSelectPage extends Component {
    constructor(props) {
        super(props);

        let schools = [];
        for (let i = 0; i < props.data.teamData.length; i++) {
            schools.push({
                teamName: props.data.teamData[i].teamName,
                suggestion: props.data.teamData[i].suggestion,
                selected: '',
                selectedName: '',
                selectedCity: '',
                selectedState: ''
            });
        }
        
        this.state = {schools: schools, done: false, matchId: ''};

        this.selectSchool = this.selectSchool.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount = () => {
        for (let i = 0; i < this.props.data.teamData.length; i++) {
            if (this.props.data.teamData[i].suggestion) {
                this.selectSchool({id: i, school: this.props.data.teamData[i].suggestion});
            }
        }
    }
    

    selectSchool(info) {
        let id = info.id;
        let school = info.school;

        let schools = this.state.schools;
        let schoolSelected = schools[id];
        schoolSelected.selected = school;
        schoolSelected.selectedName = school.name;
        schoolSelected.selectedCity = school.city;
        schoolSelected.selectedState = school.state;
        schools[id] = schoolSelected;
        this.setState({schools: schools});
    }

    unselectSchool = (id) => {
        let schools = this.state.schools;
        let teamName = schools[id].teamName;
        const newData = {
            teamName: teamName,
            selected: '',
            selectedName: '',
            selectedCity: '',
            selectedState: ''
        };
        schools[id] = newData;
        this.setState({schools: schools});
    }

    handleKeyDown = (e) => {
        let keynum;
        if (window.event) {
            keynum = e.keyCode;
        } else {
            keynum = e.which;
        }

        if (keynum === 13) {
            e.preventDefault();
            return false;
        }
    }

    handleSubmit(e) {
        e.preventDefault();

        let studentData = this.props.data.studentData;
        let teamData = this.props.data.teamData;
        let matchData = this.props.data.matchData;

        let schools = this.state.schools;

        for (let i = 0; i < schools.length; i++) {
            let name = schools[i].teamName;
            let matchingTeamIndex = 0;
            for (let j = 0; j < teamData.length; j++) {
                if (teamData[j].teamName === name) {
                    matchingTeamIndex = j;
                    break;
                }
            }
            let matchingTeam = teamData[matchingTeamIndex];
            if (schools[i].selected) {
                matchingTeam.id = schools[i].selected._id;
                matchingTeam.school = schools[i].selectedName;
            } else {
                matchingTeam.id = undefined;
            }
            teamData[matchingTeamIndex] = matchingTeam;
        }

        API.submitMatch(studentData, teamData, matchData)
        .then(res => {
            this.setState({done: true, matchId: res.data.matchId});
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {

        let schoolForm = (
            <form className='form-container' onSubmit={this.handleSubmit} onKeyDown={this.handleKeyDown}>
            <Helmet><title>Link Schools | AcDecDB</title></Helmet>
            {
                this.state.schools.map((school, index) => (<SchoolSelect key={index} schoolname={school.teamName} suggestion={school.suggestion} selectId={index} shouldColor
                    selectedName={school.selectedName} selectedCity={school.selectedCity} selectedState={school.selectedState} selectSchool={this.selectSchool} unselectSchool={this.unselectSchool} />))
            }
                <input className='form-submit' type='submit' value='Create Match' />
            </form>
        );

        let doneMessage = (
            <div>
                <div>Match created</div>
                <div className='page-link'><Link to={`match/${this.state.matchId}`}>Go to match</Link></div>
            </div>
            );

        let retval = (this.state.done) ? doneMessage : schoolForm;

        return retval;
    }
}