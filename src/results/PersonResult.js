import React, {Component} from 'react';
import '../styles.css';
import {Link} from 'react-router-dom';
import API from '../API';
import { SchoolSelect } from '../admin/SchoolSelect';

export class PersonResult extends Component {
	constructor(props) {
		super(props);
		this.state = {
			result: '', 
			editing: false,
			edits: {
				name: '',
				schoolId: '',
                selectedSchoolName: '',
                selectedSchoolCity: '',
                selectedSchoolState: '',
			}
		};
	}

	getPerson() {
		API.getPerson(this.props.match.params.id)
			.then(res => {
				let person = res.data;
                if (person) {
                    let newEdits = {
                        name: person.name,
                        schoolId: person.schoolId,
                        selectedSchoolName: '',
                        selectedSchoolCity: '',
                        selectedSchoolState: ''
					};
					res.data.seasons = res.data.seasons.sort((a, b) => {
						let no1 = parseFloat(a.year);
						let no2 = parseFloat(b.year);
			
						let result = (no1 > no2) ? -1 : 1;
						return result;
					});
                    this.setState({result: res, edits: newEdits})
                } else this.setState({result: res});
			})
			.catch(err => {
				console.log(err);
			});
	}

	makeEditable = () => {
		this.setState({editing: true});
	};

	cancelEditing = () => {
		this.setState({editing: false});
	};

    selectSchool = info => {
        let school = info.school;

        let newEdits = {
            name: this.state.edits.name,
            schoolId: school._id,
            selectedSchoolName: school.name,
            selectedSchoolCity: school.city,
            selectedSchoolState: school.state
        }
        this.setState({edits: newEdits});
    };

    unselectSchool = index => {
        let newEdits = {
            name: this.state.edits.name,
            schoolId: this.state.result.data._id,
            selectedSchoolName: '',
            selectedSchoolCity: '',
            selectedSchoolState: ''
        }
        this.setState({edits: newEdits});
    }

	handleEditsChanged = e => {
		let field = e.target.name;
		let newVal = e.target.value;
		this.setState(prevState => ({
			edits: {
				...prevState.edits,
				[field]: newVal
			}
		}));
	}

	submitEdits = e => {
		e.preventDefault();
		API.updatePerson(this.state.result.data._id, this.state.edits)
			.then(res => {
				if (res.data.success) {
					this.cancelEditing();
					this.getPerson();
				} else {
					alert('Something went wrong, Chief. Check the logs.');
					console.log(res);
				}
			});
	};

	componentDidMount() {
		this.getPerson();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.match.params.id !== prevProps.match.params.id) {
			this.getPerson();
		}
	}

	render() {
		if (!this.state.result) {
			return <div></div>;
		} else if (!this.state.result.data) {
            return <h1>This ain't it, Chief.</h1>;
        }

		if (this.state.result.data._id) {
			let person = this.state.result.data;
            if (this.state.editing) {
                return (
                    <div className='form-container'>
                        <div>Editing {person.name}</div>
                        <br />
                        <form onSubmit={this.submitEdits}>
                            <div className='form-field'>
                                <label className='form-label'>Name</label>
                                <input className='form-text-input' type="text" name="name" value={this.state.edits.name} onChange={this.handleEditsChanged} />
                            </div>
                            <div>
                                <SchoolSelect schoolname={'School'} selectId={0} selectedName={this.state.edits.selectedSchoolName}
                                    selectedCity={this.state.edits.selectedSchoolCity} selectedState={this.state.edits.selectedSchoolState}
                                    selectSchool={this.selectSchool} unselectSchool={this.unselectSchool} />
                            </div>
							<input className='form-submit' type="submit" value="Make Edits" />
							<button className='form-cancel' type="button" onClick={this.cancelEditing}>Cancel</button>
                        </form>
                        

                    </div>
                );
            }
			let seasonData;
			if (person.seasons.length > 0) {
				seasonData = (
					<table className='info-page-table'>
					<tbody>
						<tr className='info-page-table-first-row'>
							<td>Year</td>
							<td>Round One</td>
							<td>Regionals</td>
							<td>State</td>
							<td>Nationals</td>
						</tr>
					{
						person.seasons.map((season) => {
							let roundone = (season.roundone) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.roundoneId}?school=${person.schoolId}`}>{season.roundone} ({season.roundoneGPA})</Link>
								</td>
								) : (<td>-</td>);

							let regionals = (season.regionals) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.regionalsId}?school=${person.schoolId}`}>{season.regionals} ({season.regionalsGPA})</Link>
								</td>
								) : (<td>-</td>);

							let state = (season.state) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.stateId}?school=${person.schoolId}`}>{season.state} ({season.stateGPA})</Link>
								</td>
								) : (<td>-</td>);

							let nationals = (season.nationals) ? 
								(<td className='is-link'>
									<Link to={`/match/${season.nationalsId}?school=${person.schoolId}`}>{season.nationals} ({season.nationalsGPA})</Link>
								</td>
								) : (<td>-</td>);


							return (<tr key={season.year}>
								<td>{season.year}</td>
								{roundone}
								{regionals}
								{state}
								{nationals}
							</tr>);
						})
					}
					</tbody>
					</table>
				);
			} else {
				seasonData = <div className='search-result-none'>No season data yet!</div>
			}

			let subtitle = <div><Link style={{display: 'inline', textDecoration: 'underline'}} to={`/school/${person.schoolId}`}>{person.fullSchool || person.school}</Link></div>;
            let thirdTitle = (person.city && person.state) ? `${person.city}, ${person.state}` : (person.city || person.state);

			let editButtons;
			if (!API.canEdit()) {
				editButtons = (null);
			} else {
				editButtons = (
					<div>
						<button onClick={this.makeEditable}>Edit</button>
						<button>Delete</button>
					</div>
				);
			}

			return (
				<div className='info-page'>
                    <div className='small-header'>DECATHLETE</div>
					<div className='info-page-header'>
						<div className='info-title'>{person.name}</div>
						<div className='info-subtitle'>{subtitle}</div>
                        <div className='info-third-title'>{thirdTitle}</div>
						{editButtons}
					</div>
                    <div className='info-page-section'>Match Results</div>
					{seasonData}
				</div>
			);
		}
	}

}