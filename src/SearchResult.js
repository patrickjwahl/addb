import React, {Component} from 'react';
import './styles.css';
import axios from 'axios';
import {Link} from 'react-router-dom';

export class SearchResult extends Component {
	constructor(props) {
		super(props);
		this.state = {result: ''};
		this.performSearch = this.performSearch.bind(this);
	}

	performSearch() {
		let query = this.props.location.search;
		if (!query) return;
		let address = `http://${window.location.hostname}:3001/api/search${query}`;
		axios.get(address)
		.then(res => {
			this.setState({result: res});
		})
		.catch(err => {
			console.log(err);
		});
	}
	
	componentDidMount() {
		this.performSearch();
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.location.search !== this.props.location.search) {
			this.performSearch();
		}
	}

	render() {
		let retval;

		let schoolResults;

		let resultsFound = false;

		if (!this.state.result) {
			retval = <div className='search-prompt'>Type in the search box to begin</div>;
		} else {
			if (this.state.result.data.schools.length > 0) {
				schoolResults = (
					<div className='search-result-category'>
						<div className='search-result-category-title'>Schools</div>
						<ul className='search-result-sublist'>
						{
							this.state.result.data.schools.map((school) => (
								<Link to={`/school/${school._id}`} key={school._id}>
									<li className='search-result'>
										<div className='search-result-title'>{school.name}</div>
										<div className='search-result-subtitle'>{school.city}, {school.state}</div>
									</li>
								</Link>
							))
						}
						</ul>
					</div>
				);
				resultsFound = true;
			}

			if (resultsFound) {
				retval = (
					<div className='search-result-list'>
						{schoolResults}
					</div>
				);
			} else {
				retval = <div className='search-result-none'>No results found</div>;
			}
		}

		return retval;
	}

}