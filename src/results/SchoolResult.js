import React, {Component} from 'react';
import '../styles.css';
import {Link} from 'react-router-dom';
import API from '../API';

export class SchoolResult extends Component {
    constructor(props) {
        super(props);
        this.state = {
            result: '', 
            editing: false, 
            edits: {
                name: '',
                fullName: '',
                state: '',
                city: '',
                region: '',
                district: '',
            }
        };
        this.getSchool = this.getSchool.bind(this);
    }

    getSchool() {
        API.getSchool(this.props.match.params.id)
            .then(res => {
                let school = res.data;
                let newEdits = {
                    name: school.name,
                    fullName: school.fullName,
                    state: school.state,
                    city: school.city,
                    region: school.region,
                    district: school.district
                };
                for (let i = 0; i < res.data.teams.length; i++) {
                    res.data.teams[i].seasons = res.data.teams[i].seasons.sort((a, b) => {
                        let no1 = parseFloat(a.year);
                        let no2 = parseFloat(b.year);
            
                        let result = (no1 > no2) ? -1 : 1;
                        return result;
                    });
                }
                this.setState({result: res, edits: newEdits});
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
        API.updateSchool(this.state.result.data._id, this.state.edits)
            .then(res => {
                if (res.data.success) {
                    this.cancelEditing();
                    this.getSchool();
                } else {
                    alert('Something went wrong, chief. Check the logs.');
                    console.log(res);
                }
            });
    };

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

        if (this.state.editing) {
            return (
                <div className='form-container'>
                    <div>Editing {this.state.result.data.name}</div>
                    <br />
                    <form onSubmit={this.submitEdits}>
                        <div className='form-field'>
                            <label className='form-label'>Name</label>
                            <input className='form-text-input' type="text" name="name" value={this.state.edits.name} onChange={this.handleEditsChanged} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label'>Full Name</label>
                            <input className='form-text-input' type="text" name="fullName" value={this.state.edits.fullName} onChange={this.handleEditsChanged} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label'>City</label>
                            <input className='form-text-input' type="text" name="city" value={this.state.edits.city} onChange={this.handleEditsChanged} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label'>State</label>
                            <input className='form-text-input' type="text" name="state" value={this.state.edits.state} onChange={this.handleEditsChanged} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label'>District</label>
                            <input className='form-text-input' type="text" name="district" value={this.state.edits.district} onChange={this.handleEditsChanged} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label'>Region</label>
                            <input className='form-text-input' type="text" name="region" value={this.state.edits.region} onChange={this.handleEditsChanged} />
                        </div>
                        <input className='form-submit' type="submit" value="Make Edits" />
                        <button className='form-cancel' type="button" onClick={this.cancelEditing}>Cancel</button>
                    </form>
                    

                </div>
            );
        }

        if (this.state.result.data._id) {
            let school = this.state.result.data;
            let teamData;
            if (school.teams.length > 0) {
                teamData = (
                    <div>
                    <div className='info-page-section'>Match Results</div>
                    {school.teams.map(team => (
                    <div key={team.teamName}>
                        <div className='info-page-subsection'>{team.teamName}</div>
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
                            team.seasons.map((season) => {
                                let roundone = (season.roundone) ? 
                                    (<td className='is-link'>
                                        <Link to={`/match/${season.roundoneId}?school=${school._id}`}>{season.roundone}</Link>
                                    </td>
                                    ) : (<td>-</td>);

                                let regionals = (season.regionals) ? 
                                    (<td className='is-link'>
                                        <Link to={`/match/${season.regionalsId}?school=${school._id}`}>{season.regionals}</Link>
                                    </td>
                                    ) : (<td>-</td>);

                                let state = (season.state) ? 
                                    (<td className='is-link'>
                                        <Link to={`/match/${season.stateId}?school=${school._id}`}>{season.state}</Link>
                                    </td>
                                    ) : (<td>-</td>);

                                let nationals = (season.nationals) ? 
                                    (<td className='is-link'>
                                        <Link to={`/match/${season.nationalsId}?school=${school._id}`}>{season.nationals}</Link>
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
                    </div>
                    ))}
                    </div>
                );
            } else {
                teamData = <div className='search-result-none'>No season data yet!</div>
            }

            let title;
            if (school.fullName) {
                title = school.fullName;
            } else {
                title = school.name;
            }

            let subtitle;
            if (school.city && school.state) {
                subtitle = `${school.city}, ${school.state}`;
            } else {
                subtitle = `${school.city}${school.state}`;
            }

            let thirdTitle;
            if (school.district && school.region) {
                thirdTitle = `${school.district}, ${school.region}`;
            } else {
                thirdTitle = `${school.district}${school.region}`;
            }

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
                    <div className='small-header'>SCHOOL</div>
                    <div className='info-page-header'>
                        <div className='info-title'>{title}</div>
                        <div className='info-subtitle'>{subtitle}</div>
                        <div className='info-third-title'>{thirdTitle}</div>
                        {editButtons}
                    </div>
                    {teamData}
                </div>
            );
        }
    }

}