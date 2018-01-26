import React, {Component} from 'react';
import {SchoolSelectPage} from './SchoolSelectPage';
import axios from 'axios';

export class MatchCreatePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			year: '',
			round: 'roundOne',
			region: '',
			state: '',
			date: '',
			site: '',
			numObjs: 7,
			numSubs: 3,
			events: {
				math: true,
				music: true,
				econ: true,
				science: true,
				lit: true,
				art: true,
				socialScience: true,
				essay: true,
				speech: true,
				interview: true,
				objs: true,
				subs: true
			},
			serverData: '',
		};

		this.handleTextChange = this.handleTextChange.bind(this);
		this.handleRoundChange = this.handleRoundChange.bind(this);
		this.handleEventCheck = this.handleEventCheck.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleTextChange(e) {
		let id = e.target.id;
		this.setState({[id]: e.target.value});
	}

	handleRoundChange(e) {
		this.setState({round: e.target.value});
	}

	handleEventCheck(e) {
		if (e.target.value === 'obj') {
			let numObjs = this.state.numObjs;
			if (e.target.checked) {
				numObjs++;
			} else {
				numObjs--;
			}

			let events = this.state.events;
			events[e.target.id] = e.target.checked;
			events.objs = numObjs > 0;
			this.setState({events: events, numObjs: numObjs});
		} else {
			let numSubs = this.state.numSubs;
			if (e.target.checked) {
				numSubs++;
			} else {
				numSubs--;
			}
			
			let events = this.state.events;
			events[e.target.id] = e.target.checked;
			events.subs = numSubs > 0;
			this.setState({events: events, numSubs: numSubs});
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		let formData = new FormData();
		let studentData = document.querySelector('#student-data').files[0];
		let teamData = document.querySelector('#team-data').files[0];
		let address = `http://${window.location.hostname}:3001/api/matchcreate`;

		console.log(this.state.date);

		formData.append('studentData', studentData);
		formData.append('teamData', teamData);
		formData.append('year', this.state.year);
		formData.append('round', this.state.round);
		formData.append('region', this.state.region);
		formData.append('state', this.state.state);
		formData.append('date', this.state.date);
		formData.append('site', this.state.site);

		let events = this.state.events;
		for (let key in events) {
			formData.append(key, events[key]);
		}

		axios.post(address, formData, {
		    headers: {
		      'Content-Type': 'multipart/form-data'
		    }
		}).then(res => {
			this.setState({serverData: res.data});
		}).catch(err => {
			console.log(err);
		});
	}

	render() {

		let regionSelect;
		if (this.state.round !== 'state' && this.state.round !== 'national') {
			regionSelect = (
				<div>
					<label>Region:</label>
					<input id='region' type='text' onChange={this.handleTextChange} value={this.state.region} />
				</div>
			);
		}

		let stateSelect;
		if (this.state.round !== 'national') {
			stateSelect = (
				<div>
					<label>State:</label>
					<input id='state' type='text' onChange={this.handleTextChange} value={this.state.state} />
				</div>
			);
		}

		let retval;
		if (!this.state.serverData) {
			retval = (
				<form onSubmit={this.handleSubmit}>
					<div>
						<label>Year:</label>
						<input id='year' type='text' onChange={this.handleTextChange} value={this.state.year} />
					</div>
					<div>
						<label>Round:</label>
						<select id='round' onChange={this.handleRoundChange}>
							<option value="roundOne">Round One</option>
							<option value="regional">Regional</option>
							<option value="state">State</option>
							<option value="national">National</option>
						</select>
					</div>
					{regionSelect}
					{stateSelect}
					<div>
						<label>Date:</label>
						<input id='date' type='text' onChange={this.handleTextChange} value={this.state.date} />
					</div>
					<div>
						<label>Site:</label>
						<input id='site' type='text' onChange={this.handleTextChange} value={this.state.site} />
					</div>
					<div>
						<div>
							<label htmlFor='math'>Math</label>
							<input value='obj' type='checkbox' checked={this.state.events.math} id='math' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='music'>Music</label>
							<input value='obj' type='checkbox' checked={this.state.events.music} id='music' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='econ'>Econ</label>
							<input value='obj' type='checkbox' checked={this.state.events.econ} id='econ' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='science'>Science</label>
							<input value='obj' type='checkbox' checked={this.state.events.science} id='science' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='lit'>Lit</label>
							<input value='obj' type='checkbox' checked={this.state.events.lit} id='lit' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='art'>Art</label>
							<input value='obj' type='checkbox' checked={this.state.events.art} id='art' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='socialScience'>Social Science</label>
							<input value='obj' type='checkbox' checked={this.state.events.socialScience} id='socialScience' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='essay'>Essay</label>
							<input value='sub' type='checkbox' checked={this.state.events.essay} id='essay' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='speech'>Speech</label>
							<input value='sub' type='checkbox' checked={this.state.events.speech} id='speech' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label htmlFor='interview'>Interview</label>
							<input value='sub' type='checkbox' checked={this.state.events.interview} id='interview' onChange={this.handleEventCheck} />
						</div>
					</div>
					<div>
						<label>Upload Student Data:</label>
						<input id='student-data' type='file' accept='.csv' />
					</div>
					<div>
						<label>Upload Team Data:</label>
						<input id='team-data' type='file' accept='.csv' />
					</div>
					<div>
						<input type='submit' value='Submit' />
					</div>
				</form>
			);
		} else {
			retval = <SchoolSelectPage data={this.state.serverData} />;
		}

		return retval;
	}
}