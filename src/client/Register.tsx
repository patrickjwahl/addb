import API from '@/client/API'
import { Helmet } from 'react-helmet'
import { ReactNode, useState } from 'react'
import { ApiResponse, LoginResult } from '../shared/types/response'
import { Link } from 'react-router-dom'

const Layout = ({ children }: { children: ReactNode }): JSX.Element => {
    return (
        <div>
            <Helmet><title>Register | AcDecDB</title></Helmet>
            <div className='form-container'>
                <img src='/img/howdy.jpg' width={150} style={{ margin: '10px 0' }} />
                <h3 style={{ marginTop: 0 }}>Howdy...</h3>
                {children}
            </div>
        </div>
    )
}

export default function Register({ loginCallback }: { loginCallback: () => void }) {

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [result, setResult] = useState<ApiResponse<LoginResult> | null | undefined>()

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(null)
        setUsername(e.target.value)
    }

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResult(null)
        setPassword(e.target.value)
    }

    const validateInput = (): string | null => {
        if (!username) {
            return "Please enter a username."
        }
        if (!password) {
            return "Please enter a password"
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters long"
        }

        if ((password.match(/[A-Z]/g) || []).length == 0) {
            return "Password must contain at least 1 uppercase letter"
        }

        if ((password.match(/[a-z]/g) || []).length == 0) {
            return "Password must contain at least 1 lowercase letter"
        }

        if ((password.match(/[0-9]/g) || []).length == 0) {
            return "Password must contain at least 1 number"
        }

        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const validationResult = validateInput()
        if (validationResult) {
            setResult({ success: false, message: validationResult })
        } else {
            const result = await API.register({ username: username, password: password })
            setResult(result)
            loginCallback()
        }
    }

    let loginResult
    if (!result) {
        loginResult = (null)
    } else if (!result.success) {
        loginResult = <div>{result.message}</div>
    } else {
        return (
            <Layout>
                <div>Welcome, {result.data?.username}</div>
            </Layout>
        )
    }

    return (
        <Layout>
            <form className='login-form' onSubmit={handleSubmit}>
                <div className='form-field'>
                    <label className='form-label' htmlFor="nam">Username</label>
                    <input className='form-text-input' type="text" name="username" value={username} onChange={handleUsernameChange} />
                </div>
                <div className='form-field'>
                    <label className='form-label' htmlFor="pw">Password</label>
                    <input className='form-text-input' type="password" name="password" value={password} onChange={handlePasswordChange} />
                </div>
                <input className='form-submit' type="submit" value="Sign Up" />
                <div style={{ display: 'inline-block' }}><Link to='/login'><button style={{ marginTop: 20 }} className='form-button'>I already have an account!</button></Link></div>
            </form>
            {loginResult}
        </Layout >
    )
}