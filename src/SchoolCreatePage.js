import React, {Component} from 'react';
import axios from 'axios';

class SchoolCreatePage extends Component {
	constructor(props) {
		super(props);
		this.state = {
			schoolData: {
				name: '',
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
		let address = `http://${window.location.hostname}:3001/api/school`;
		axios.post(address, {
			school: this.state.schoolData
		})
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
				<form onSubmit={this.handleSubmit}>
					<div>
						<label>Name:</label>
						<input type='text' id='name' onChange={this.handleTextChanged} value={this.state.schoolData.name} />
					</div>
					<div>
						<label>City:</label>
						<input type='text' id='city' onChange={this.handleTextChanged} value={this.state.schoolData.city} />
					</div>
					<div>
						<label>State:</label>
						<input type='text' id='state' onChange={this.handleTextChanged} value={this.state.schoolData.state} />
					</div>
					<div>
						<label>Region:</label>
						<input type='text' id='region' onChange={this.handleTextChanged} value={this.state.schoolData.region} />
					</div>
					<div>
						<label>District:</label>
						<input type='text' id='district' onChange={this.handleTextChanged} value={this.state.schoolData.district} />
					</div>
					<div>
						<input type='submit' value='Create' />
					</div>
				</form>
			);
		}

		return retval;
	}
}

export default SchoolCreatePage;