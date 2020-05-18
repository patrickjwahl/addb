import React, {Component} from 'react';
import {SchoolSelectPage} from './SchoolSelectPage';
import API from '../API';
import matchImg from '../assets/img/match.png';
import { stateNames } from '../util/consts';

export class MatchCreatePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			year: '',
			round: 'roundone',
			region: '',
			state: stateNames[0],
			date: '',
			site: '',
			hasDivisions: false,
			incompleteData: false,
			access: 1,
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
			serverError: '',
			serverData: '',
		};

		this.handleTextChange = this.handleTextChange.bind(this);
		this.handleRoundChange = this.handleRoundChange.bind(this);
		this.handleDivisionsChange = this.handleDivisionsChange.bind(this);
		this.handleAccessChange = this.handleAccessChange.bind(this);
		this.handleIncompleteChange = this.handleIncompleteChange.bind(this);
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
	
	handleStateChange = e => {
		this.setState({state: e.target.value});
	};

	handleDivisionsChange(e) {
		this.setState({hasDivisions: (e.target.value === 'divisions')});
	}

	handleAccessChange(e) {
		this.setState({access: (e.target.value)});
	}

	handleIncompleteChange(e) {
		this.setState({incompleteData: !this.state.incompleteData});
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
		this.setState({serverError: ''});

		let formData = new FormData();
		let studentData = document.querySelector('#student-data').files[0];
		let teamData = document.querySelector('#team-data').files[0];
		let overallData;
		if (this.state.incompleteData) overallData = document.querySelector('#overall-data').files[0];

		formData.append('studentData', studentData);
		formData.append('teamData', teamData);
		if (this.state.incompleteData) formData.append('overallData', overallData);
		formData.append('year', this.state.year);
		formData.append('round', this.state.round);
		formData.append('region', this.state.region);
		formData.append('state', this.state.state);
		formData.append('date', this.state.date);
		formData.append('site', this.state.site);
		formData.append('hasDivisions', this.state.hasDivisions);
		formData.append('access', this.state.access);
		formData.append('incompleteData', this.state.incompleteData);

		let events = this.state.events;
		for (let key in events) {
			formData.append(key, events[key]);
		}

		API.createMatch(formData)
		.then(res => {
			if (res.data.success === false) {
				this.setState({serverError: res.data.message});
			} else {
				this.setState({serverData: res.data});
			}
		})
		.catch(err => {
			console.log(err);
		});
	}

	render() {

		let regionSelect;
		if (this.state.round !== 'state' && this.state.round !== 'nationals') {
			regionSelect = (
				<div className='form-field'>
					<label className='form-label'>Region*</label>
					<input className='form-text-input' id='region' type='text' onChange={this.handleTextChange} value={this.state.region} />
				</div>
			);
		}

		let stateSelect;
		if (this.state.round !== 'nationals') {
			stateSelect = (
				<div className='form-field'>
					<label className='form-label'>State*</label>
					<select className='form-select' id='state' onChange={this.handleStateChange} value={this.state.state}>
						{
							stateNames.map(name => (
								<option key={name} value={name}>{name}</option>
							))
						}
					</select>
				</div>
			);
		}

		let retval;
		if (!this.state.serverData) {
			retval = (
				<form className='form-container' onSubmit={this.handleSubmit}>
					<img src={matchImg} width={200} style={{margin:'10px 0'}} />
					<div style={{fontSize: '12px', textAlign: 'left', marginBottom: 10}}>* <i>indicates required field.</i></div>
					<div className='form-field'>
						<label className='form-label'>Year*</label>
						<input className='form-text-input' id='year' type='text' onChange={this.handleTextChange} value={this.state.year} />
					</div>
					<div className='form-field'>
						<label className='form-label'>Round*</label>
						<select className='form-select' id='round' onChange={this.handleRoundChange}>
							<option value="roundone">Round One</option>
							<option value="regionals">Regionals</option>
							<option value="state">State</option>
							<option value="nationals">Nationals</option>
						</select>
					</div>
					{regionSelect}
					{stateSelect}
					<div className='form-field'>
						<label className='form-label'>Date*</label>
						<input className='form-text-input' id='date' type='text' onChange={this.handleTextChange} value={this.state.date} />
					</div>
					<div className='form-field'>
						<label className='form-label'>Site</label>
						<input className='form-text-input' id='site' type='text' onChange={this.handleTextChange} value={this.state.site} />
					</div>
					<div style={{textAlign:'left'}} className='form-field'>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='math'>Math</label>
							<input value='obj' type='checkbox' checked={this.state.events.math} id='math' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline', margin:'0 5px'}} className='form-label' htmlFor='music'>Music</label>
							<input value='obj' type='checkbox' checked={this.state.events.music} id='music' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline', margin:'0 5px'}} className='form-label' htmlFor='econ'>Econ</label>
							<input value='obj' type='checkbox' checked={this.state.events.econ} id='econ' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline', margin:'0 5px'}} className='form-label' htmlFor='science'>Science</label>
							<input value='obj' type='checkbox' checked={this.state.events.science} id='science' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='lit'>Lit</label>
							<input value='obj' type='checkbox' checked={this.state.events.lit} id='lit' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='art'>Art</label>
							<input value='obj' type='checkbox' checked={this.state.events.art} id='art' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='socialScience'>Social Science</label>
							<input value='obj' type='checkbox' checked={this.state.events.socialScience} id='socialScience' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='essay'>Essay</label>
							<input value='sub' type='checkbox' checked={this.state.events.essay} id='essay' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='speech'>Speech</label>
							<input value='sub' type='checkbox' checked={this.state.events.speech} id='speech' onChange={this.handleEventCheck} />
						</div>
						<div>
							<label style={{display:'inline-block', margin:'0 5px'}} className='form-label' htmlFor='interview'>Interview</label>
							<input value='sub' type='checkbox' checked={this.state.events.interview} id='interview' onChange={this.handleEventCheck} />
						</div>
					</div>
					<div className='form-field'>
						<label className='form-label'>Divisions</label>
						<select className='form-select' id='divs' value={this.state.hasDivisions ? 'divisions': 'na'} onChange={this.handleDivisionsChange}>
							<option value="na">N/A</option>
							<option value="divisions">Divisions</option>
						</select>
					</div>
					<div className='form-field'>
						<label className='form-label'>Access Level</label>
						<select className='form-select' id='acce' onChange={this.handleAccessChange} value={this.state.access}>
							<option value='1'>1 - Public</option>
							{API.accessLevel() > 1 ? <option value='2'>2 - Privileged</option> : (null)}
							{API.accessLevel() > 2 ? <option value='3'>3 - Secret</option> : (null)}
						</select>
					</div>
					<div className='form-field'>
						<label style={{display:'inline-block', margin:'0 5px', width:'75%'}} className='form-label' className='form-label' htmlFor='incom'>Does this competition have incomplete student event data?</label>
						<input type='checkbox' checked={this.state.incompleteData} id='incom' onChange={this.handleIncompleteChange} />
					</div>
					<div className='form-field'>
						<label className='form-label'>Upload Student Breakdown Data:</label>
						<input id='student-data' type='file' accept='.csv' />
					</div>
					{this.state.incompleteData ? (
						<div className='form-field'>
							<label className='form-label'>Upload Student Overall Data:</label>
							<input id='overall-data' type='file' accept='.csv' />
						</div> ): (null)
					}
					<div className='form-field'>
						<label className='form-label'>Upload Team Data:</label>
						<input id='team-data' type='file' accept='.csv' />
					</div>
					<input className='form-submit' type='submit' value='Continue' />
					<div style={{color: '#ff3b3f'}}>{this.state.serverError}</div>
				</form>
			);
		} else {
			retval = <SchoolSelectPage data={this.state.serverData} />;
		}

		return retval;
	}
}