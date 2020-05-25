import React, {Component} from 'react';
import API from '../API';
import { Helmet } from 'react-helmet';

class EditsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {edits: []}
    }

    getEdits = () => {
        let lastDate;
        if (this.state.edits.length === 0) {
            lastDate = undefined;
        } else {
            lastDate = this.state.edits[this.state.edits.length - 1].datetime;
        }
        API.getEdits(lastDate)
            .then(res => {
                let resultEdits = res.data.edits;
                this.setState({edits: this.state.edits.concat(resultEdits)});
            });
    }

    componentDidMount() {
        this.getEdits();
    }
    
    render() {
        return (<div className='info-page'>
            <Helmet><title>Recent Edits | AcDecDB</title></Helmet>
            <div>
                {this.state.edits.map(edit => (
                    <div style={{marginBottom: 10}}>
                        <div style={{fontSize:'10px'}}>{new Date(edit.datetime).toLocaleDateString()} {new Date(edit.datetime).toLocaleTimeString()}</div>
                        {edit.summary}
                        <div style={{fontSize:'12px'}}>[{edit.user}]</div>
                    </div>
                ))}
            </div>
            <button onClick={this.getEdits}>Moar</button>
        </div>);
    }
}

export default EditsPage;