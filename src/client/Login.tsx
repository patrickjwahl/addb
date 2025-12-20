import API from '@/client/API'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useState } from 'react'
import { ApiResponse, LoginResult } from '../shared/types/response'

export default function Login() {

    const location = useLocation()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [result, setResult] = useState<ApiResponse<LoginResult> | null | undefined>()

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const result = await API.logIn(username, password)
        setResult(result)

    }

    let loginResult
    if (!result) {
        loginResult = (null)
    } else if (!result.success) {
        loginResult = <div>{result.message}</div>
    } else {
        const { from } = location.state || { from: { pathname: '/' } }
        loginResult = <Navigate to={{ pathname: from.pathname }} />
    }

    const { redirected } = location.state || false
    let admonishment = redirected ? <div style={{ marginTop: 20 }}><span className='admonishment'>You are not allowed to see that!</span></div> : (null)

    return (
        <div>
            <Helmet><title>Login | AcDecDB</title></Helmet>
            {admonishment}
            <div className='form-container'>
                <img src='/img/log.jpg' width={150} style={{ margin: '10px 0' }} />
                <h3 style={{ marginTop: 0 }}>"Log" in...</h3>
                <form className='login-form' onSubmit={handleSubmit}>
                    <div className='form-field'>
                        <label className='form-label' htmlFor="nam">Username</label>
                        <input className='form-text-input' type="text" name="username" value={username} onChange={handleUsernameChange} />
                    </div>
                    <div className='form-field'>
                        <label className='form-label' htmlFor="pw">Password</label>
                        <input className='form-text-input' type="password" name="password" value={password} onChange={handlePasswordChange} />
                    </div>
                    <input className='form-submit' type="submit" value="Let's Go!" />
                    <div style={{ display: 'inline-block' }}><Link to='/register'><button style={{ marginTop: 20 }} className='form-button'>I don't have an account!</button></Link></div>
                </form>
                {loginResult}
            </div>
        </div>
    )
}
