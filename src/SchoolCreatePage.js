import React, {Component} from 'react';
import API from './API';
import schoolImg from './assets/img/school.jpg';

class SchoolCreatePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			schoolData: {
				name: '',
				fullName: '',
				city: '',
				state: '',
				region: '',
				district: ''
			},
			done: false
		}

		this.handleTextChanged = this.handleTextChanged.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleTextChanged(e) {
		let schoolData = this.state.schoolData;
		let id = e.target.id;
		schoolData[id] = e.target.value;
		this.setState({schoolData: schoolData});
	}

	handleSubmit(e) {
		e.preventDefault();
		API.createSchool(this.state.schoolData)
		.then(res => {
			this.setState({done: true});
		})
		.catch(err => {
			console.log(err);
		});
	}

	render() {

		let retval;
		if (this.state.done) {
			retval = <div>School added!</div>;
		} else {
			retval = (
				<form className='form-container' onSubmit={this.handleSubmit}>
					<img src={schoolImg} width={150} style={{margin:'10px 0'}} />
					<div className='form-field'>
						<label className='form-label'>Name</label>
						<input className='form-text-input' type='text' id='name' onChange={this.handleTextChanged} value={this.state.schoolData.name} />
					</div>
					<div className='form-field'>
						<label className='form-label'>Full Name</label>
						<input className='form-text-input' type='text' id='fullName' onChange={this.handleTextChanged} value={this.state.schoolData.fullName} />
					</div>
					<div className='form-field'>
						<label className='form-label'>City</label>
						<input className='form-text-input' type='text' id='city' onChange={this.handleTextChanged} value={this.state.schoolData.city} />
					</div>
					<div className='form-field'>
						<label className='form-label'>State</label>
						<input className='form-text-input' type='text' id='state' onChange={this.handleTextChanged} value={this.state.schoolData.state} />
					</div>
					<div className='form-field'>
						<label className='form-label'>Region</label>
						<input className='form-text-input' type='text' id='region' onChange={this.handleTextChanged} value={this.state.schoolData.region} />
					</div>
					<div className='form-field'>
						<label className='form-label'>District</label>
						<input className='form-text-input' type='text' id='district' onChange={this.handleTextChanged} value={this.state.schoolData.district} />
					</div>
					<input className='form-submit' type='submit' value='Create' />
				</form>
			);
		}

		return retval;
	}
}

export default SchoolCreatePage;