import api from "@/client/API"
import { CreateUserCredentials } from "@/shared/types/request"
import { LoginResult } from "@/shared/types/response"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function UserPropertiesEdit() {

    const [message, setMessage] = useState<string | null | undefined>(null)
    const [users, setUsers] = useState<{ [id: string]: LoginResult }>({})
    const [selectedUser, _setSelectedUser] = useState<string | null>(null)
    const [canEdit, setCanEdit] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [privateAccess, setPrivateAccess] = useState(false)

    const messageRef = useRef(null)

    const setSelectedUser = (id: string) => {
        if (id == 'null') {
            _setSelectedUser(null)
        } else {
            _setSelectedUser(id)
            setIsAdmin(users[id].isAdmin)
            setCanEdit(users[id].canEdit)
            setPrivateAccess(users[id].privateAccess)
        }
    }

    const navigate = useNavigate()

    const fetchUsers = async () => {
        const result = await api.getUsers()
        if (result.success && result.data) {
            setUsers(result.data)
        } else {
            navigate('/')
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        if (!selectedUser) {
            return
        }

        const userMetadata: CreateUserCredentials = {
            id: parseInt(selectedUser),
            canEdit,
            isAdmin,
            privateAccess
        }

        const result = await api.upsertUser(userMetadata)
        if (result.success) {
            setMessage('User updated successfully. They may have to log in and out to see the changes.')
            fetchUsers()
        } else {
            setMessage("Something went wrong.")
        }

        setTimeout(() => {
            setMessage(null)
        }, 4000)
    }

    return (
        <form className="edit-form" onSubmit={submitForm}>
            <div className="edit-form-row">
                <div>User:</div>
                <select value={selectedUser || 'null'} onChange={e => setSelectedUser(e.target.value)}>
                    <option value="null">Select...</option>
                    {Object.keys(users).map(id => {
                        return <option key={id} value={id}>{users[id].username}</option>
                    })}
                </select>
            </div>
            {selectedUser && <>
                <div className="edit-form-row" style={{ flexDirection: 'column', alignItems: 'flex-start', marginTop: 20, padding: '0 50px' }}>
                    <label>
                        <input type="checkbox" checked={privateAccess} onChange={e => setPrivateAccess(e.target.checked)} />
                        <b>Insider:</b> can view hidden individual performances.
                    </label>
                    <label>
                        <input type="checkbox" checked={canEdit} onChange={e => setCanEdit(e.target.checked)} />
                        <b>Editor:</b> can make changes to the DB, add matches, modify scores etc.
                    </label>
                    <label>
                        <input type="checkbox" checked={isAdmin} onChange={e => setIsAdmin(e.target.checked)} />
                        <b>Admin:</b> can modify user permissions through this page.
                    </label>
                </div>
                <div style={{ marginTop: '10px' }} className="edit-form-row">
                    <input type="submit" value={"Save"} />
                </div>
            </>
            }
            {message && (
                <div className="edit-form-row">
                    <span ref={messageRef}>{message}</span>
                </div>
            )}
        </form>
    )
}