import React, {Component} from 'react';
import {Link} from 'react-router-dom';

export class StatePageYearDisplay extends Component {
    constructor(props) {
        super(props);
        this.state = {open: false};
        this.canOpen = Object.keys(props.data.data.regionals).length > 2 || Object.keys(props.data.data.roundone).length > 2;
    }

    toggleOpen = () => {
        if (this.canOpen) {
            this.setState({open: !this.state.open});
        }
    };

    render() {
        let { year, data } = this.props.data;
        let content = data.state._scores.map((entry, index) => (
            <div key={index} className='search-result-subtitle'>{index + 1}. {entry[0]} - {entry[1]}</div>
        ));
        let shouldStateLink = content.length > 0;
        if (content.length === 0) {
            content = (
                <div>
                    <br/>
                    <div className='search-result-subtitle'>No data!</div>
                    <br/>
                </div>
            );
        }
        let link;
        if (shouldStateLink) {
            link = (
                <Link to={`/match/${data.state._id}`}>
                    <div className='state-page-link'>
                        <div className='search-result-title'>State</div>
                        {content}
                    </div>
                </Link>
            );
        } else {
            link = (
                <div className='state-page-link state-page-link-disabled'>
                    <div className='search-result-title'>State</div>
                    {content}
                </div>
            );
        }
        let stateBox = (
            <div className='state-page-stack'>
                {link}
            </div>
        );
        
        let regionalsBox, roundoneBox;
        if (this.state.open && Object.keys(data.regionals).length > 1) {
            regionalsBox = (
                <div className='state-page-stack'>
                {Object.keys(data.regionals).map(region => {
                    if (region === '_scores') return (null);
                    let regionData = data.regionals[region];
                    return (
                        <Link key={region} to={`/match/${regionData._id}`} className='state-page-stack-link' >
                        <div className='state-page-link'>
                            <div className='search-result-title'>{region}</div>
                            {regionData._scores.map((entry, index) => (
                                <div key={index} className='search-result-subtitle'>{index + 1}. {entry[0]} - {entry[1]}</div>
                            ))}
                        </div>
                        </Link>
                    );
                })}
                </div>
            );
        } else {
            let content = data.regionals._scores.slice(0, 3).map((entry, index) => (
                <div key={index} className='search-result-subtitle'>{index + 1}. {entry[0]} - {entry[1]}</div>
            ));
            let disableLink = content.length === 0;
            let shouldRegionalsLink = Object.keys(data.regionals).length === 2;
            if (content.length === 0) {
                content = (
                    <div>
                        <br/>
                        <div className='search-result-subtitle'>No data!</div>
                        <br/>
                    </div>
                );
            }
            let link;
            if (disableLink) {
                link = (
                    <div className='state-page-link state-page-link-disabled'>
                        <div className='search-result-title'>Regionals</div>
                        {content}
                    </div>
                );
            } else if (shouldRegionalsLink) {
                let id = data.regionals[Object.keys(data.regionals).filter(key => key != '_scores')[0]]._id;
                link = (
                    <Link to={`/match/${id}`} >
                        <div className='state-page-link'>
                            <div className='search-result-title'>Regionals</div>
                            {content}
                        </div>
                    </Link>
                );
            } else {
                link = (
                    <div className='state-page-link state-page-fake-link'>
                        <div className='search-result-title'>Regionals</div>
                        {content}
                    </div>
                );
            }
            regionalsBox = (
                <div className='state-page-stack'>
                    {link}
                </div>
            );
        }
        if (this.state.open && Object.keys(data.roundone).length > 1) {
            roundoneBox = (
                <div className='state-page-stack'>
                {Object.keys(data.roundone).map(region => {
                    if (region === '_scores') return (null);
                    let regionData = data.roundone[region];
                    return (
                        <Link key={region} to={`/match/${regionData._id}`} className='state-page-stack-link' >
                        <div className='state-page-link'>
                            <div className='search-result-title'>{region}</div>
                            {regionData._scores.map((entry, index) => (
                                <div key={index} className='search-result-subtitle'>{index + 1}. {entry[0]} - {entry[1]}</div>
                            ))}
                        </div>
                        </Link>
                    );
                })}
                </div>
            );
        } else {
            let content = data.roundone._scores.slice(0, 3).map((entry, index) => (
                <div key={index} className='search-result-subtitle'>{index + 1}. {entry[0]} - {entry[1]}</div>
            ));
            let disableLinkR1 = content.length === 0;
            let shouldRoundoneLink = Object.keys(data.roundone).length === 2;
            if (content.length === 0) {
                content = (
                    <div>
                        <br/>
                        <div className='search-result-subtitle'>No data!</div>
                        <br/>
                    </div>
                );
            }
            let r1link;
            if (disableLinkR1) {
                r1link = (
                    <div className='state-page-link state-page-link-disabled'>
                        <div className='search-result-title'>Round One</div>
                        {content}
                    </div>
                );
            } else if (shouldRoundoneLink) {
                let id = data.roundone[Object.keys(data.roundone).filter(key => key != '_scores')[0]]._id;
                r1link = (
                    <Link to={`/match/${id}`} >
                        <div className='state-page-link'>
                            <div className='search-result-title'>Round One</div>
                            {content}
                        </div>
                    </Link>
                );
            } else {
                r1link = (
                    <div className='state-page-link state-page-fake-link'>
                        <div className='search-result-title'>Round One</div>
                        {content}
                    </div>
                );
            }
            roundoneBox = (
                <div className='state-page-stack'>
                {r1link}
                </div>
            );
        }
        return (
            <div className={'state-page-year-bar' + (this.state.open ? ' state-page-year-bar-open' : '')} onClick={this.toggleOpen}>
                <div className='state-page-year-bar-year'>
                    <span>{year}</span>
                </div>
                {stateBox}
                <div style={{borderLeft: "1px solid #777"}} hidden={!this.state.open}></div>
                {regionalsBox}
                <div style={{borderLeft: "1px solid #777"}} hidden={!this.state.open}></div>
                {roundoneBox}
            </div>
        )
    }
}