import React, {Component} from 'react';
import style from './style';
import axios from 'axios';

class EntryForm extends Component {
	constructor(props) {
		super(props);

		this.state = {
			category: '',
			decathlete: '',
			overall: '',
		};

		this.handleCategoryChanged = this.handleCategoryChanged.bind(this);
		this.handleDecathleteChanged = this.handleDecathleteChanged.bind(this);
		this.handleOverallChanged = this.handleOverallChanged.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleCategoryChanged(e) {
		this.setState({category: e.target.value});
	}

	handleDecathleteChanged(e) {
		this.setState({decathlete: e.target.value});
	}

	handleOverallChanged(e) {
		this.setState({overall: e.target.value});
	}

	
	handleSubmit(e) {
		e.preventDefault();
		let category = this.state.category.trim();
		let decathlete = this.state.decathlete.trim();
		let overall = this.state.overall.trim();
		if (!category || !decathlete || !overall) return;
		axios.post('http://localhost:3001/api/scores', {
			category: category,
			decathlete: decathlete,
			overall: overall
		})
			.then(res => {alert(res)})
			.catch(err => {alert('FUCK ' + err)});
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<div style={style.formLine}>
					<label>Category:</label>
					<input type="text" onChange={this.handleCategoryChanged} value={this.state.category} />
				</div>
				<div style={style.formLine}>
					<label>Decathlete:</label>
					<input type="text" onChange={this.handleDecathleteChanged} value={this.state.decathlete} />
				</div>
				<div style={style.formLine}>
					<label>Overall:</label>
					<input type="text" onChange={this.handleOverallChanged} value={this.state.overall} />
				</div>
				<div style={style.formLine}>
					<input type="submit" value="Add" />
				</div>
			</form>
		);
	}
};

export default EntryForm;