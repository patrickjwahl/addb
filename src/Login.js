import React, {Component} from 'react';
import API from './API';
import { Redirect } from 'react-router-dom';
import logImg from './assets/img/log.jpg';

class Login extends Component {
    constructor(props) {
        super(props);
        console.log(props.location.state);
        this.state = {
            username: '',
            password: '',
            result: undefined
        };
    }

    handleUsernameChange = e => {
        this.setState({username: e.target.value});
    };

    handlePasswordChange = e => {
        this.setState({password: e.target.value});
    };

    handleSubmit = e => {
        e.preventDefault();
        API.logIn(this.state.username, this.state.password).then(res => {
            this.setState({result: res});
        });
        
    };

    render() {

        let loginResult;
        if (this.state.result === undefined) {
            loginResult = (null);
        } else if (this.state.result.success === false) {
            loginResult = <div>{this.state.result.message}</div>
        } else {
            const { from } = this.props.location.state || { from: { pathname: '/' } };
            loginResult = <Redirect to={{pathname: from.pathname}} />
        }

        const { redirected } = this.props.location.state || false;
        let admonishment = redirected ? <div style={{marginTop: 20}}><span className='admonishment'>You are not allowed to see that!</span></div> : (null);

        return (
            <div>
                {admonishment}
                <div className='form-container'>
                    <img src={logImg} width={150} style={{margin:'10px 0'}} />
                    <form className='login-form' onSubmit={this.handleSubmit}>
                        <div className='form-field'>
                            <label className='form-label' htmlFor="nam">Username</label>
                            <input className='form-text-input' type="text" name="username" value={this.state.username} onChange={this.handleUsernameChange} />
                        </div>
                        <div className='form-field'>
                            <label className='form-label' htmlFor="pw">Password</label>
                            <input className='form-text-input' type="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
                        </div>
                        <input className='form-submit' type="submit" value="Let's Go!" />
                    </form>
                    {loginResult}
                </div>
            </div>
        )
    }
}

export default Login;
