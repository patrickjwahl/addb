import React, {Component} from 'react';
import API from '../API';
import { stateNames } from '../util/consts';

export class PotentialMerges extends Component {
    constructor(props) {
        super(props);
        this.state = {state: stateNames[0], suggestions: []};
    }

    handleStateChanged = e => {
        this.setState({state: e.target.value});
    };

    getSuggestions = () => {
        const { state } = this.state;
        API.getPotentialMerges(state).then(res => {
            this.setState({suggestions: res.data.potentialMerges});
        });
    };

    render() {
        return (
            <div style={{width: '50%', marginLeft: 20, color: 'black'}}>
            <select id='state' onChange={this.handleStateChanged} value={this.state.state}>
                {
                    stateNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                    ))
                }
            </select>
            <button style={{marginLeft: 5, marginBottom: 10}} onClick={this.getSuggestions}>Get Potential Merges</button>
            {
                this.state.suggestions.map(suggestion => (
                    <div style={{marginBottom: 5}}>
                        <span><b>{suggestion.school}:</b> {suggestion.person1}, {suggestion.person2}</span>
                    </div>
                ))
            }
            </div>
        );
    }
}