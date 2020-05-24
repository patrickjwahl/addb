import React from 'react';
import { PersonSelect } from './PersonSelect';
import API from '../API';
import mergeImg from '../assets/img/merge.jpg';
import { Link } from 'react-router-dom';

export class PeopleMerger extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            god: {
                selectedPerson: '',
                selectedName: '',
                selectedSchool: '',
                selectedFullSchool: ''
            },
            peon: {
                selectedPerson: '',
                selectedName: '',
                selectedSchool: '',
                selectedFullSchool: ''
            },
            done: false
        }
    }

    selectGod = info => {
        let god = {
            selectedPerson: info.person,
            selectedName: info.person.name,
            selectedSchool: info.person.school,
            selectedFullSchool: info.person.fullSchool
        };
        this.setState({god: god});
    };

    unselectGod = id => {
        let god = {
            selectedPerson: '',
            selectedName: '',
            selectedSchool: '',
            selectedFullSchool: ''
        };
        this.setState({god: god});
    };

    selectPeon = info => {
        let peon = {
            selectedPerson: info.person,
            selectedName: info.person.name,
            selectedSchool: info.person.school,
            selectedFullSchool: info.person.fullSchool
        };
        this.setState({peon: peon});
    };

    unselectPeon = id => {
        let peon = {
            selectedPerson: '',
            selectedName: '',
            selectedSchool: '',
            selectedFullSchool: ''
        };
        this.setState({peon: peon});
    };

    submitMerge = () => {
        if (!this.state.god.selectedPerson || !this.state.peon.selectedPerson) {
            alert('You gotta select some people ya dingus');
            return;
        }
        API.mergePeople(this.state.god.selectedPerson._id, this.state.peon.selectedPerson._id)
            .then(res => {
                if (res.data.success) {
                    this.setState({done: true});
                } else {
                    alert('Something went wrong, Chief. Check the logs.');
                }
            });
    }
    
    render() {
        if (this.state.done) {
            return (
                <div>
                    <div>Your Franken-person has been created!</div>
                    <div className='page-link'><Link to={`person/${this.state.god.selectedPerson._id}`}>Look upon thy Adam...</Link></div>
                </div>
            );
        }
        return (
            <div className='form-container'>
                <img src={mergeImg} width={150} style={{margin:'10px 0'}} />
                <PersonSelect personName={'God'} selectedPerson={this.state.god.selectedPerson} selectedName={this.state.god.selectedName} selectedFullSchool={this.state.god.selectedFullSchool}
                    selectedSchool={this.state.god.selectedSchool} selectId={0} selectPerson={this.selectGod} unselectPerson={this.unselectGod} />
                 <PersonSelect personName={'Peon'} selectedPerson={this.state.peon.selectedPerson} selectedName={this.state.peon.selectedName} selectedFullSchool={this.state.peon.selectedFullSchool}
                    selectedSchool={this.state.peon.selectedSchool} selectId={0} selectPerson={this.selectPeon} unselectPerson={this.unselectPeon} />
                <button className='form-submit' type="button" onClick={this.submitMerge}>Merge</button>
            </div>
        );
    }
}