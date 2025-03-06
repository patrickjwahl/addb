import api from "@/client/API"
import { CreateUserCredentials } from "@/shared/types/request"
import { Prisma } from "@prisma/client"
import { useEffect, useState } from "react"

export default function UserPropertiesEdit({ user, callback }: { user?: Prisma.UserGetPayload<{}> | null, callback: (userId: number | null) => void }) {

    const [username, setUsername] = useState(user?.username || '')
    const [password, setPassword] = useState('')
    const [guiAccess, setGuiAccess] = useState(1)
    const [validationError, setValidationError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null | undefined>(null)


    const validateInput = (): string | null => {
        if (!username) {
            return "Please enter a username."
        }
        if (!user && !password) {
            return "Please enter a password"
        }

        return null
    }

    useEffect(() => {
        if (user && user.access == 4) {
            setGuiAccess(5)
        } else if (user && user.access == 3 && user.canEdit) {
            setGuiAccess(4)
        }
    }, [])

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setValidationError(null)
        const err = validateInput()
        if (err) {
            setValidationError(err)
            return
        }

        const userMetadata: CreateUserCredentials = {
            id: user?.id,
            username: username,
            access: guiAccess > 3 ? guiAccess - 1 : guiAccess,
            canEdit: guiAccess > 3,
            password: password
        }

        const result = await api.upsertUser(userMetadata)
        if (!result.success) {
            setMessage(result.message)
        } else {
            alert("User created successfully")
            callback(null)
        }
    }

    return (
        <form className="edit-form" onSubmit={submitForm}>
            <div className="edit-form-row">
                <input placeholder="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="edit-form-row">
                <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div className="edit-form-row">
                <select value={guiAccess} onChange={e => { setGuiAccess(parseInt(e.target.value)) }}>
                    <option value={1}>No Special Access</option>
                    <option value={2}>Private Data Access</option>
                    <option value={3}>Top Secret Access</option>
                    <option value={4}>Can Edit the DB</option>
                    <option value={5}>Can Create Users</option>
                </select>
            </div>
            <div style={{ marginTop: '10px' }} className="edit-form-row">
                <input type="submit" value={!user ? "Create" : "Save"} />
            </div>
            {validationError && (
                <div className="edit-form-row">
                    <span className="validation-error">{validationError}</span>
                </div>
            )}
            {message && (
                <div className="edit-form-row">
                    <span className="edit-form-message">{message}</span>
                </div>
            )}
        </form>
    )
}