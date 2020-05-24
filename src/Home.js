import React, {Component} from 'react';
import './styles.css';
import API from './API';
import {Link} from 'react-router-dom';
import Loader from 'react-loader-spinner'

export class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {result: ''};
        this.getRecents = this.getRecents.bind(this);
    }

    getRecents() {
        API.getRecentMatches()
        .then(res => {
            this.setState({result: res});
        })
        .catch(err => {
            console.log(err);
        });
    }
    
    componentDidMount() {
        this.getRecents();
    }

    render() {
        let retval;

        let resultsFound = false;
        
        let matchResults = (null);

        let statesList = ['California', 'Texas', 'Arizona', 'Wisconsin', 'Ohio', "Pennsylvania", 'Alaska',
        'Illinois', 'Iowa', 'Massachusetts', 'New_Jersey', 'Nebraska', 'Utah', 'Georgia', 'Maine', 'Rhode_Island'].sort();

        let stateLinks = (
            <div>
                <div className='search-result-category-title'>States</div>
                <div className='state-list-container'>
                    {
                        statesList.map(state => (
                            <Link key={state} to={`/state/${state}`}>
                                <div className='state-list-object'>
                                    <img src={require(`./assets/img/${state}.jpg`)} height={50} style={{borderRadius: 5, border: '1px solid black'}} />
                                    <div className='search-result-title state-button-title'>{state.replace('_', ' ')}</div>
                                </div>
                            </Link>
                        ))
                    }
                </div>
            </div>
        );

        if (!this.state.result) {
                retval = <Loader
                type="TailSpin"
                height={40}
                width={40}
                timeout={10000}
                style={{marginTop: '50'}}
            />
        } else {
            if (this.state.result.data.matches.length > 0) {
                matchResults = (
                    <div className='search-result-category'>
                        <div className='search-result-category-title'>Recent Matches</div>
                        <ul className='search-result-sublist'>
                        {
                            this.state.result.data.matches.map((match) => (
                                <Link to={`/match/${match.id}`} key={match.id}>
                                    <li className='search-result' style={{textAlign:'center'}}>
                                        <div className='search-result-title'>{match.year} {match.round.charAt(0).toUpperCase() + match.round.slice(1)}</div>
                                        <div className='search-result-subtitle'>{(match.round !== 'nationals') ? match.state + ' ' : ''}{match.round !== 'nationals' && match.round !== 'state' ? match.region + ' ' : ''}</div>
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
                    <div className='state-result-list'>
                        <div className='flex-column'>{matchResults}</div>
                        <div className='flex-column-big'>{stateLinks}</div>
                    </div>
                );
            } else {
                retval = <Loader
                    type="TailSpin"
                    height={40}
                    width={40}
                    timeout={10000}
                    style={{marginTop: '50'}}
                />
            }
        }

        return retval;
    }

}