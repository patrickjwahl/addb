import React, {Component} from 'react';
import {Link, withRouter} from 'react-router-dom';
import './styles.css';
import axios from 'axios';

const categories = {
	math: 'Math',
	music: 'Music',
	econ: 'Econ',
	science: 'Science',
	lit: 'Lit',
	art: 'Art',
	socialScience: 'Social Science',
	essay: 'Essay',
	speech: 'Speech',
	interview: 'Interview',
	objs: 'Objs',
	subs: 'Subs'
}

class MatchResult extends Component {
	constructor(props) {
		super(props);
		this.state = {result: ''};
		this.getMatch = this.getMatch.bind(this);
		this.handleSchoolClicked = this.handleSchoolClicked.bind(this);
	}

	getMatch() {
		axios.get(`http://localhost:3001/api/match/${this.props.match.params.id}`)
			.then(res => {
				this.setState({result: res});
			})
			.catch(err => {
				console.log(err);
			});
	}

	handleSchoolClicked(e) {
		let schoolName = e.target.innerText;
		let teams = this.state.result.data.teams;
		for (let i = 0; i < teams.length; i++) {
			if (teams[i].school === schoolName) {
				this.props.history.push(`/school/${teams[i].id}`);
				return;
			}
		}
	}

	componentDidMount() {
		this.getMatch();
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.props.match.params.id !== prevProps.match.params.id) {
			this.getMatch();
		}
	}

	render() {
		if (!this.state.result) {
			return <div></div>;
		}
		if (this.state.result.data._id) {
			let match = this.state.result.data;
			let events = match.events;

			let roundName, subtitle;
			if (match.round === 'roundOne') {
				roundName = 'Round One';
				subtitle = `${match.state} ${match.region}`;
			} else if (match.round === 'regional') {
				roundName = 'Regional';
				subtitle = `${match.state} ${match.region}`;
			} else if (match.round === 'state') {
				roundName = 'State';
				subtitle = match.state;
			} else {
				roundName = 'National';
				subtitle = '';
			}

			let thirdTitle;
			if (match.date && match.site) {
				thirdTitle = `${match.date} - ${match.site}`;
			} else if (match.date) {
				thirdTitle = match.date;
			} else if (match.site) {
				thirdTitle = match.site;
			} else {
				thirdTitle = '';
			}

			let headings = ['School', 'Team', 'GPA', 'Decathlete', 'Overall'];
			if (events.math) {
				headings.push(categories.math);
			}
			if (events.music) {
				headings.push(categories.music);
			}
			if (events.econ) {
				headings.push(categories.econ);
			}
			if (events.science) {
				headings.push(categories.science);
			}
			if (events.lit) {
				headings.push(categories.lit);
			}
			if (events.art) {
				headings.push(categories.art);
			}
			if (events.socialScience) {
				headings.push(categories.socialScience);
			}
			if (events.essay) {
				headings.push(categories.essay);
			}
			if (events.speech) {
				headings.push(categories.speech);
			}
			if (events.interview) {
				headings.push(categories.interview);
			}
			if (events.objs) {
				headings.push(categories.objs);
			}
			if (events.subs) {
				headings.push(categories.subs);
			}

			let students = match.students;
			let teams = match.teams;

			return (
				<div className='info-page'>
					<div className='info-page-header'>
						<div className='info-title'>{match.year} {roundName}</div>
						<div className='info-subtitle'>{subtitle}</div>
						<div className='info-third-title'>{thirdTitle}</div>
					</div>
					<table className='info-page-table'>
					<tbody>
						<tr className='info-page-table-first-row'>
						{
							headings.map((text) => (
								<td key={text}>{text}</td>
							))
						}
						</tr>
					{
						students.map((student) => (
							<tr key={student.decathlete}>
								<td className='is-link' onClick={this.handleSchoolClicked}>{student.school}</td>
								<td>{student.team}</td>
								<td>{student.gpa}</td>
								<td>{student.decathlete}</td>
								<td className='bold'>{student.overall}</td>
								{(events.math) ? (<td>{student.math}</td>) : (null)}
								{(events.music) ? (<td>{student.music}</td>) : (null)}
								{(events.econ) ? (<td>{student.econ}</td>) : (null)}
								{(events.science) ? (<td>{student.science}</td>) : (null)}
								{(events.lit) ? (<td>{student.lit}</td>) : (null)}
								{(events.art) ? (<td>{student.art}</td>) : (null)}
								{(events.socialScience) ? (<td>{student.socialScience}</td>) : (null)}
								{(events.essay) ? (<td>{student.essay}</td>) : (null)}	
								{(events.speech) ? (<td>{student.speech}</td>) : (null)}
								{(events.interview) ? (<td>{student.interview}</td>) : (null)}
								{(events.objs) ? (<td className='bold'>{student.objs}</td>) : (null)}
								{(events.subs) ? (<td>{student.subs}</td> ): (null)}								
							</tr>
						))
					}
					</tbody>
					</table>
					<table className='info-page-table'>
					<tbody>
						<tr className='info-page-table-first-row'>
							<td>Rank</td>
							<td>School</td>
							<td>Overall</td>
							<td>Objs</td>
							<td>Subs</td>
						</tr>
					{
						teams.map((team) => (
							<tr key={team.rank}>
								<td>{team.rank}</td>
								<td className='is-link'><Link to={`/school/${team.id}`}>{team.school}</Link></td>
								<td>{team.overall}</td>
								<td>{team.objs}</td>
								<td>{team.subs}</td>
							</tr>
						))
					}
					</tbody>
					</table>
				</div>
			);
		}
	}

}

export default withRouter(MatchResult);