import React, {Component} from 'react';
import axios from 'axios';
import '../styles.css';

var mouseDownHappened = false;
var intervalId = 0;

export class SchoolSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {query: '', result: '', focus: -1, selected: '', changed: false};

		this.handleQueryChanged = this.handleQueryChanged.bind(this);
		this.clearQuickResult = this.clearQuickResult.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleInputOnKeyDown = this.handleInputOnKeyDown.bind(this);
		this.handleResultClick = this.handleResultClick.bind(this);
		this.quickSearch = this.quickSearch.bind(this);
		this.markChanged = this.markChanged.bind(this);
	}

	markChanged() {
		this.setState({changed: true});
	}

	handleResultClick(schoolId, e) {
		e.stopPropagation();
		mouseDownHappened = true;
		this.handleOnBlur();
		let school = this.state.result.data.schools.filter(function(obj) {
			return obj._id === schoolId;
		})[0];
		this.props.selectSchool({id: this.props.selectId, school: school});
		this.setState({changed: true});
	}

	clearQuickResult(e) {
		this.setState({result: ''});
	}

	handleOnBlur() {
		clearTimeout(intervalId);
		if (!mouseDownHappened) {
			this.setState({result: '', focus: -1});
		}
		mouseDownHappened = false;
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
				if (focus < this.state.result.data.schools.length - 1) {
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

					this.props.selectSchool({id: this.props.selectId, school: this.state.result.data.schools[this.state.focus]});
					this.setState({changed: true});
				}
			} else {
				this.setState({focus: -1});
			}
		}
	}

	quickSearch(newQuery) {
		return (function() {
			let query = newQuery;
			let address = `http://${window.location.hostname}:3001/api/search?query=${query}`;
			axios.get(address)
			.then(res => {
				if (res.data.schools.length > 0) {
					this.setState({result: res});
				} else {
					this.setState({result: ''})
				}
			})
			.catch(err => {
				console.log(err);
			});
		}).bind(this);
	}

	handleQueryChanged(e) {
		let query = e.target.value;
		clearTimeout(intervalId);
		this.setState({query: query});
		if (query.length < 2) {
			this.setState({result: ''});
			return;
		}
		intervalId = setTimeout(this.quickSearch(query), 100);
	}

	render() {

		let quickResult;

		if (this.state.result) {
			quickResult = (
				<ul className='quick-result-list'>
				{
					this.state.result.data.schools.map((school, index) => {
						let liClass;
						if (index === this.state.focus) {
							liClass = 'quick-result focus';
						} else {
							liClass = 'quick-result';
						}
						return (
							<li className={liClass} key={school._id} onMouseDown={this.handleResultClick.bind(this, school._id)}>
								<div className='quick-result-title'>{school.fullName || school.name}</div>
								<div className='quick-result-subtitle'>{school.city ? school.city + ', ' : ''}{school.state}</div>
							</li>
						);
					})
				}
				</ul>
			);
		} else {
			quickResult = (null);
		}

		let selectedSchool;
		if (this.props.selectedName) {
			selectedSchool = (
				<div>
					<div className='selected-school'>{this.props.selectedName} ({this.props.selectedCity ? `${this.props.selectedCity}, ${this.props.selectedState}` : this.props.selectedState})
					<button className='selected-school-button' type="button" onClick={() => {this.markChanged(); this.props.unselectSchool(this.props.selectId)}}>x</button>
					</div>
				</div>
			);
		} else {
			selectedSchool = (null);
		}

		let color = 'none';
		if (this.props.shouldColor) {
			if (!this.state.changed && this.props.selectedName) {
				color = 'yellow';
			} else if (!this.state.changed) {
				color = '#ff4545';
			} else {
				color = '#66ff66';
			}
		}

		return (
			<div className='form-field' style={{backgroundColor: color}}>
				<label className='form-label'>{this.props.schoolname}</label>
				<div className='search-input-container' style={{width:'100%'}} tabIndex='0' onBlur={this.handleOnBlur}>
					<input className='form-text-input' type='text' value={this.state.query} onChange={this.handleQueryChanged} onKeyDown={this.handleInputOnKeyDown} />
					{quickResult}
				</div>
				{selectedSchool}
			</div>
		);
	}
}