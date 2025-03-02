import UserPropertiesEdit from "@/client/components/edit/UserPropertiesEdit"
import { useNavigate } from "react-router-dom"

export default function UserCreatePage() {

    const navigate = useNavigate()

    const userCreated = () => {
        navigate(`/`)
    }

    return (
        <div className="info-page">
            <h1 style={{ textAlign: 'center' }}>New User</h1>
            {/* <div className="header-image">
                <img style={{ height: 200 }} src="/img/moon.jpg" />
            </div> */}
            <UserPropertiesEdit user={null} callback={userCreated} />
        </div>
    )
}