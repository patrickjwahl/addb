import React, {Component} from 'react';
import axios from 'axios';
import {SchoolSelect} from './SchoolSelect';
import './styles.css';

export class SchoolSelectPage extends Component {
	constructor(props) {
		super(props);

		let schools = [];
		for (let i = 0; i < props.data.teamData.length; i++) {
			schools.push({
				name: props.data.teamData[i].school,
				selected: '',
				selectedName: '',
				selectedCity: '',
				selectedState: ''
			});
		}

		this.state = {schools: schools, done: false};

		this.selectSchool = this.selectSchool.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
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

	handleSubmit(e) {
		e.preventDefault();

		let studentData = this.props.data.studentData;
		let teamData = this.props.data.teamData;
		let matchData = this.props.data.matchData;

		let schools = this.state.schools;

		for (let i = 0; i < schools.length; i++) {
			let name = schools[i].name;
			let matchingTeamIndex = 0;
			for (let j = 0; j < teamData.length; j++) {
				if (teamData[j].school === name) {
					matchingTeamIndex = j;
					break;
				}
			}
			let matchingTeam = teamData[matchingTeamIndex];
			matchingTeam.id = schools[i].selected._id;
			teamData[matchingTeamIndex] = matchingTeam;
		}

		let address = `http://${window.location.hostname}:3001/api/match`;
		axios.post(address, {
			studentData: studentData,
			teamData: teamData,
			matchData: matchData
		})
		.then(res => {
			this.setState({done: true});
		})
		.catch(err => {
			console.log(err);
		});
	}

	render() {

		let schoolForm = (
			<form onSubmit={this.handleSubmit}>
			{
				this.state.schools.map((school, index) => (<SchoolSelect key={index} schoolname={school.name} selectId={index} 
					selectedName={school.selectedName} selectedCity={school.selectedCity} selectedState={school.selectedState} selectSchool={this.selectSchool} />))
			}
				<input type='submit' value='Submit' />
			</form>
		);

		let doneMessage = <div>Match created</div>;

		let retval = (this.state.done) ? doneMessage : schoolForm;

		return retval;
	}
}