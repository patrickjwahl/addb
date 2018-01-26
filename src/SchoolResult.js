import React, {Component} from 'react';
import './styles.css';
import {Link} from 'react-router-dom';
import axios from 'axios';

export class SchoolResult extends Component {
	constructor(props) {
		super(props);
		this.state = {result: ''};
		this.getSchool = this.getSchool.bind(this);
	}

	getSchool() {
		axios.get(`http://localhost:3001/api/school/${this.props.match.params.id}`)
			.then(res => {
				this.setState({result: res});
			})
			.catch(err => {
				console.log(err);
			});
	}

	componentDidMount() {
		this.getSchool();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.match.params.id !== prevProps.match.params.id) {
			this.getSchool();
		}
	}

	render() {
		if (!this.state.result) {
			return <div></div>;
		} 
		if (this.state.result.data._id) {
			let school = this.state.result.data;
			let seasonData;
			if (school.seasons.length > 0) {
				seasonData = (
					<table className='info-page-table'>
					<tbody>
						<tr className='info-page-table-first-row'>
							<td>Year</td>
							<td>Round One</td>
							<td>Regional</td>
							<td>State</td>
							<td>National</td>
						</tr>
					{
						school.seasons.map((season) => {
							let roundOne = (season.roundOne) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.roundOneId}`}>{season.roundOne}</Link>
								</td>
								) : (<td>-</td>);

							let regional = (season.regional) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.regionalId}`}>{season.regional}</Link>
								</td>
								) : (<td>-</td>);

							let state = (season.state) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.stateId}`}>{season.state}</Link>
								</td>
								) : (<td>-</td>);

							let national = (season.national) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.nationalId}`}>{season.national}</Link>
								</td>
								) : (<td>-</td>);


							return (<tr key={season.year}>
								<td>{season.year}</td>
								{roundOne}
								{regional}
								{state}
								{national}
							</tr>);
						})
					}
					</tbody>
					</table>
				);
			} else {
				seasonData = <div className='search-result-none'>No season data yet!</div>
			}

			return (
				<div className='info-page'>
					<div className='info-page-header'>
						<div className='info-title'>{school.name}</div>
						<div className='info-subtitle'>{school.city}, {school.state}</div>
						<div className='info-third-title'>{school.district}, {school.region}</div>
					</div>
					{seasonData}
				</div>
			);
		}
	}

}