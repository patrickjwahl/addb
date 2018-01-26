import React, {Component} from 'react';
import {withRouter, Link} from 'react-router-dom';
import './styles.css';
import axios from 'axios';

var mouseDownHappened = false;
var intervalId = 0;

class SearchForm extends Component {
	constructor(props) {
		super(props);
		this.state = {query: '', result: '', focus: -1};
		this.handleQueryChanged = this.handleQueryChanged.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.clearQuickResult = this.clearQuickResult.bind(this);
		this.handleOnBlur = this.handleOnBlur.bind(this);
		this.handleInputOnKeyDown = this.handleInputOnKeyDown.bind(this);
		this.quickSearch = this.quickSearch.bind(this);
	}

	registerMouseDown(e) {
		mouseDownHappened = true;
	}

	clearQuickResult(e) {
		this.setState({result: ''});
	}

	quickSearch(newQuery) {
		return (function() {
			let query = newQuery;
			let address = `http://${window.location.hostname}:3001/api/search?query=${query}`;
			axios.get(address)
			.then(res => {
				for (let key in res.data) {
					if (res.data[key].length > 0) {
						this.setState({result: res});
						return;
					}
					this.setState({result: ''});
				}
			})
			.catch(err => {
				console.log(err);
			});
		}).bind(this);
	}

	handleQueryChanged(e) {
		var query = e.target.value;
		clearInterval(intervalId);
		this.setState({query: query});
		if (query.length < 2) {
			this.setState({result: ''});
			return;
		}
		intervalId = setInterval(this.quickSearch(query), 100);
	}

	handleOnBlur() {
		clearInterval(intervalId);
		if (!mouseDownHappened) {
			this.setState({result: '', focus: -1});
		}
		mouseDownHappened = false;
	}

	handleSubmit(e) {
		e.preventDefault();
		if (this.state.query.length < 2) return;
		this.handleOnBlur();
		this.props.history.push(`/search?query=${this.state.query}`);
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
					this.props.history.push(`/school/${this.state.result.data.schools[this.state.focus]._id}`);
				}
			} else {
				this.setState({focus: -1});
			}
		}
	}

	render() {

		let quickResult;
		let formClass;

		if (this.state.result) {
			formClass = 'search-input search-input-with-results';
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
							<Link to={`/school/${school._id}`} key={school._id} onMouseDown={this.registerMouseDown} onClick={this.clearQuickResult}>
								<li className={liClass}>
									<div className='quick-result-title'>{school.name}</div>
									<div className='quick-result-subtitle'>{school.city}, {school.state}</div>
								</li>
							</Link>
						);
					})
				}
				</ul>
			);
		} else {
			formClass = 'search-input';
			quickResult = (null);
		}

		return (
			<div>
				<form className="search-form" onSubmit={this.handleSubmit}>
					<div className='search-input-container' tabIndex='0' onBlur={this.handleOnBlur}>
						<input className={formClass} type="text" onChange={this.handleQueryChanged} value={this.state.query} onKeyDown={this.handleInputOnKeyDown} />
						{quickResult}
					</div>
					<input className="search-submit" type="submit" value="Search" />
				</form>
			</div>
		);
	}
}

export default withRouter(SearchForm);