import React, {Component} from 'react';
import API from '../API';

class CreateUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            access: 1,
            canEdit: false,
            result: undefined
        };
    }

    handleUsernameChange = e => {
        this.setState({username: e.target.value});
    };

    handlePasswordChange = e => {
        this.setState({password: e.target.value});
    };

    handleAccessChange = e => {
        this.setState({access: e.target.value});
    };

    handleEditChange = e => {
        this.setState({canEdit: !this.state.canEdit});
    }

    handleSubmit = e => {
        e.preventDefault();
        API.createUser({
            username: this.state.username, 
            password: this.state.password,
            access: this.state.access,
            canEdit: this.state.canEdit
        }).then(res => {
            this.setState({result: res});
        });
    };

    render() {

        let loginResult;
        if (this.state.result === undefined) {
            loginResult = (null);
        } else {
            loginResult = <div>{this.state.result.data.message}</div>
        }

        return (
            <div>
                <form onSubmit={this.handleSubmit}>
                    <div>
                        <label htmlFor="nam">User ID: </label>
                        <input type="text" name="username" value={this.state.username} onChange={this.handleUsernameChange} />
                    </div>
                    <div>
                        <label htmlFor="pw">Password: </label>
                        <input type="password" name="password" value={this.state.password} onChange={this.handlePasswordChange} />
                    </div>
                    <div>
                        <label htmlFor="acc">Access Level: </label>
                        <select onChange={this.handleAccessChange}>
                            <option value={1}>Plebeian (No special access)</option>
                            <option value={2}>Silver Club (Some special access)</option>
                            <option value={3}>Gold Club (All access)</option>
                            <option value={4}>Diamond Club (Can create users)</option>
                        </select>
                    </div>
                    <div>
                        <label>Allowed to edit: </label>
                        <input type="checkbox" checked={this.state.canEdit} onChange={this.handleEditChange} />
                    </div>
                    <div>
                        <input type="submit" value="Create" />
                    </div>
                </form>
                {loginResult}
            </div>
        )
    }
}

export default CreateUser;
