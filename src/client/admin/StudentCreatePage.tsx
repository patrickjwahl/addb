import StudentPropertiesEdit from "@/client/components/edit/StudentPropertiesEdit"
import { useNavigate } from "react-router-dom"

export default function StudentCreatePage() {

    const navigate = useNavigate()

    const studentCreated = (id: number) => {
        navigate(`/student/${id}`)
    }

    return (
        <div className="info-page">
            <h1 style={{ textAlign: 'center' }}>New Student</h1>
            {/* <div className="header-image">
                <img style={{ height: 200 }} src="/img/blind.jpg" />
            </div> */}
            <StudentPropertiesEdit student={null} callback={studentCreated} />
        </div>
    )
}