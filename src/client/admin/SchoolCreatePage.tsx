import SchoolPropertiesEdit from "@/client/components/edit/SchoolPropertiesEdit"
import { useNavigate } from "react-router-dom"

export default function SchoolCreatePage() {

    const navigate = useNavigate()

    const schoolCreated = (id: number) => {
        navigate(`/school/${id}`)
    }

    return (
        <div className="info-page">
            <h1 style={{ textAlign: 'center' }}>New School</h1>
            {/* <div className="header-image">
                <img style={{ height: 200 }} src="/img/magdalene.jpg" />
            </div> */}
            <SchoolPropertiesEdit school={null} callback={schoolCreated} />
        </div>
    )
}