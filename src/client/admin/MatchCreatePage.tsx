import MatchPropertiesEdit from "@/client/components/edit/MatchPropertiesEdit"
import { useNavigate } from "react-router-dom"

export default function MatchCreatePage() {

    const navigate = useNavigate()

    const matchCreated = (id: number) => {
        navigate(`/match/${id}`)
    }

    return (
        <div className="info-page">
            <h1 style={{ textAlign: 'center' }}>New Match</h1>
            <div className="header-image">
                <img style={{ height: 200 }} src="/img/fiona.png" />
            </div>
            <MatchPropertiesEdit match={null} callback={matchCreated} />
        </div>
    )
}