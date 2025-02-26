import api from "@/client/API"
import { StudentMetadata } from "@/shared/types/request"
import { Prisma } from "@prisma/client"
import { useState } from "react"

export default function StudentPropertiesEdit({ student, callback }: { student?: Prisma.StudentGetPayload<{}> | null, callback: (schoolId: number) => void }) {

    const [name, setName] = useState(student?.name || '')
    const [validationError, setValidationError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)

    const validateInput = (): string | null => {
        if (!name) {
            return "Please enter the name."
        }

        return null
    }

    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setValidationError(null)
        const err = validateInput()
        if (err) {
            setValidationError(err)
            return
        }

        const studentMetadata: StudentMetadata = {
            id: student?.id,
            name: name
        }

        const result = await api.upsertStudent(studentMetadata)
        if (!result.success) {
            alert(result.message)
        } else {
            setMessage("Done :)")
            callback(result.data?.id || -1)
        }
    }

    return (
        <form className="edit-form" onSubmit={submitForm}>
            <div className="edit-form-row">
                <input style={{ width: 250 }} placeholder="Name" type="text" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ marginTop: '10px' }} className="edit-form-row">
                <input type="submit" value={!student ? "Create" : "Save"} />
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