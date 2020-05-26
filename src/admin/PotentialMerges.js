import React, {Component} from 'react';
import API from '../API';
import { stateNames } from '../util/consts';
import { Link } from 'react-router-dom';

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
            let potentialMerges = res.data.potentialMerges;
            let seenCombosString = localStorage.getItem('seenCombos') || '[]';
            let seenCombos = new Set(JSON.parse(seenCombosString));
            potentialMerges.forEach(suggestion => {
                if (seenCombos.has(`${suggestion.school},${suggestion.person1.id},${suggestion.person2.id}`)) {
                    suggestion.seen = true;
                } else {
                    suggestion.seen = false;
                }
            });
            this.setState({suggestions: potentialMerges});
        });
    };

    markAsSeen = index => {
        let { suggestions } = this.state;
        let suggestionToMark = suggestions[index];
        suggestionToMark.seen = true;
        let seenCombos = new Set();
        suggestions.filter(suggestion => suggestion.seen).forEach(suggestion => {
            seenCombos.add(`${suggestion.school},${suggestion.person1.id},${suggestion.person2.id}`);
        });
        let seenCombosString = JSON.stringify(Array.from(seenCombos));
        localStorage.setItem('seenCombos', seenCombosString);

        this.setState({suggestions});
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
                this.state.suggestions.map((suggestion, index) => (
                    <div key={index} style={{marginBottom: 5, color: suggestion.seen ? 'red' : 'black'}}>
                        <span><b>{suggestion.school}:</b> <Link style={{textDecoration: 'underline', display: 'inline'}} target='_blank' to={`/person/${suggestion.person1.id}`}>{suggestion.person1.name}</Link>, <Link style={{textDecoration: 'underline', display: 'inline'}} target='_blank' to={`/person/${suggestion.person2.id}`}>{suggestion.person2.name}</Link></span>
                        <button style={{marginLeft: 10}} onClick={() => this.markAsSeen(index)}>Mark as Seen</button>
                    </div>
                ))
            }
            </div>
        );
    }
}