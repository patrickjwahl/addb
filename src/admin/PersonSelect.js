import React, {Component} from 'react';
import API from '../API';

var mouseDownHappened = false;
var intervalId = 0;

export class PersonSelect extends Component {
	constructor(props) {
		super(props);
		this.state = {query: '', result: '', focus: -1, selected: ''};

		this.handleQueryChanged = this.handleQueryChanged.bind(this);
		this.clearQuickResult = this.clearQuickResult.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleInputOnKeyDown = this.handleInputOnKeyDown.bind(this);
		this.handleResultClick = this.handleResultClick.bind(this);
		this.quickSearch = this.quickSearch.bind(this);
	}

	handleResultClick(personId, e) {
		e.stopPropagation();
		mouseDownHappened = true;
		this.handleOnBlur();
		let person = this.state.result.data.people.filter(function(obj) {
			return obj._id === personId;
		})[0];
		this.props.selectPerson({id: this.props.selectId, person: person});
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
				if (focus < this.state.result.data.people.length - 1) {
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

					this.props.selectPerson({id: this.props.selectId, person: this.state.result.data.people[this.state.focus]});
				}
			} else {
				this.setState({focus: -1});
			}
		}
	}

	quickSearch(newQuery) {
		return (function() {
			let query = newQuery;
			API.search(query)
			.then(res => {
				if (res.data.people.length > 0) {
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
					this.state.result.data.people.map((person, index) => {
						let liClass;
						if (index === this.state.focus) {
							liClass = 'quick-result focus';
						} else {
							liClass = 'quick-result';
						}
						return (
							<li className={liClass} key={person._id} onMouseDown={this.handleResultClick.bind(this, person._id)}>
								<div className='quick-result-title'>{person.name}</div>
								<div className='quick-result-subtitle'>{person.fullSchool || person.school}</div>
							</li>
						);
					})
				}
				</ul>
			);
		} else {
			quickResult = (null);
		}

		let selectedPerson;
		if (this.props.selectedName) {
			selectedPerson = (
				<div>
					<div className='selected-school'>{this.props.selectedName} ({this.props.selectedFullSchool || this.props.selectedSchool})
					<button className='selected-school-button' type="button" onClick={() => {this.props.unselectPerson(this.props.selectId)}}>x</button>
					</div>
				</div>
			);
		} else {
			selectedPerson = (null);
		}

		return (
			<div className='form-field'>
				<label className='form-label'>{this.props.personName}</label>
				<div tabIndex='0' onBlur={this.handleOnBlur}>
					<input className='form-text-input' type='text' value={this.state.query} onChange={this.handleQueryChanged} onKeyDown={this.handleInputOnKeyDown} />
					{quickResult}
				</div>
				{selectedPerson}
			</div>
		);
	}
}