import { Match, TeamPerformance } from "@/shared/types/response"
import { TableRowProps } from "./Table"
import { Category } from "@prisma/client"
import { useMemo, useState } from "react"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, rankToClass } from "@/shared/util/functions"
import { Link } from "react-router-dom"
import TeamPerformanceEdit from "../edit/TeamPerformanceEdit"
import api from "@/client/API"

interface TeamPerformanceRowProps extends TableRowProps {
    data: TeamPerformance,
    editingEnabled: boolean,
    events: Category[],
    rank: number,
    hasSq: boolean,
    match?: Match,
    showMedals: boolean,
    editCallback?: () => void,
    region?: {
        id: number,
        name: string
    }
}

const TeamPerformanceRow: React.FunctionComponent<TeamPerformanceRowProps> = ({ data: performance, editingEnabled, rank, hasSq, match, showMedals, editCallback, region }) => {

    const [editing, setEditing] = useState(false)

    const fetchData = async () => {
        const result = (await api.getTeamPerformance(performance.id))
        if (result.success) {
            setEditing(false)
            editCallback && editCallback()
        }
    }

    if (!performance) {
        return (null)
    }

    const canEdit = useMemo(() => api.canEdit(), [])

    if (!editingEnabled && editing) {
        setEditing(false)
    }

    const rankClass = (showMedals && rankToClass(rank - 1)) || ''

    if (!editing) {
        return (
            <tr key={performance.id} className={(canEdit && !performance.team.schoolId ? 'row-warning' : '')}>
                <td>{rank}</td>
                {performance.team.schoolId ? (
                    <td className="is-link">
                        <Link to={`/school/${performance.team.schoolId}`}>
                            {performance.team.name}
                            {editingEnabled && ` (${performance.team.school?.fullName || performance.team.school?.name || ''})`}
                        </Link>
                    </td>
                ) : (<td className={rankClass}>
                    {performance.team.name} {canEdit && <b>(Unlinked!)</b>}
                </td>)
                }
                {
                    match?.round == 'nationals' && <td>{performance.team.school?.state?.name}</td>
                }
                {
                    region && <td>{region.name}</td>
                }
                <td className={`${rankClass}`}>{ftoa(performance.overall)}</td>
                {match && match.events.length > 0 && match.events.length < 10 &&
                    <td className={`${rankClass}`}>{ftoa(performance.overall * (10.0 / match.events.length))}</td>
                }
                {<td>{ftoa(performance.objs)}</td>}
                {<td>{ftoa(performance.subs)}</td>}
                {hasSq && <td>{ftoa(performance.sq)}</td>}
                {editingEnabled && <td>{performance.division == 'null' ? '' : performance.division}</td>}
                {editingEnabled && <td><button onClick={() => setEditing(true)}>Edit</button></td>}
            </tr >
        )
    } else {
        return (
            <TeamPerformanceEdit performance={performance} hasSq={hasSq} callback={fetchData} match={match} />
        )
    }
}

export default TeamPerformanceRow