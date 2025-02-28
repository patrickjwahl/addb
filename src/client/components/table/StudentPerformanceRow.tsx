import { FullStudentPerformance, StudentPerformance } from "@/shared/types/response"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, possiblyShorten, rankToClass } from "@/shared/util/functions"
import { Category } from "@prisma/client"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"
import StudentPerformanceEdit from "../edit/StudentPerformanceEdit"
import api from "@/client/API"

interface StudentPerformanceRowProps extends TableRowProps {
    data: StudentPerformance,
    teamNumber: number,
    editingEnabled: boolean,
    events: Category[],
    teams: Array<{
        name: string,
        id: number
    }>,
    rank?: number,
    rankByCol: { [index: number]: number },
    showMedals: boolean
}

const StudentPerformanceRow: React.FunctionComponent<StudentPerformanceRowProps> = ({ data: initPerformance, teamNumber, editingEnabled, events, teams, rank, rankByCol, showMedals }) => {

    const [performance, setPerformance] = useState(initPerformance)
    const [editing, setEditing] = useState(false)

    const redacted = events.length == 0

    const canEdit = useMemo(() => api.canEdit(), [])

    const fetchData = async () => {
        const result = (await api.getStudentPerformance(performance.id))
        if (result.success) {
            result.data && setPerformance(result.data)
            setEditing(false)
        }
    }

    if (!editingEnabled && editing) {
        setEditing(false)
    }

    const hasObjs = useMemo((): boolean => {
        return !redacted && _hasObjs(events)
    }, [events, redacted])

    const hasSubs = useMemo((): boolean => {
        return !redacted && _hasSubs(events)
    }, [events, redacted])

    if (!performance) {
        return (null)
    }

    if (!editing) {
        return (
            <tr key={performance.id} className={(canEdit && !performance.studentId ? 'row-warning' : '')}>
                {
                    (rank != undefined) && <td className="table-cell-small">{rank + 1}</td>
                }
                {
                    performance.team.schoolId ? (
                        <td className='is-link table-cell-large'><Link to={`/school/${performance.team.schoolId}`}>{possiblyShorten(performance.team.name)}</Link></td>
                    ) : (
                        <td className="table-cell-large">{possiblyShorten(performance.team.name)}</td>
                    )
                }
                <td className="right-border">{teamNumber}</td>
                <td className="is-link table-cell-large"><Link to={`/student/${performance.studentId}`}>{possiblyShorten(performance.student?.name || '')}</Link></td>
                <td>{performance.gpa}</td>
                <td className={'bold ' + (!redacted ? 'right-border ' : '') + (showMedals ? rankToClass(rankByCol[4]) : '')}>{ftoa(performance.overall)}</td>
                {!redacted && events.map((event, index) => (
                    <td key={event} className={`table-cell-small ${showMedals ? rankToClass(rankByCol[5 + index]) : ''}`}>{ftoa((performance as FullStudentPerformance)[event])}</td>
                ))}
                {hasObjs && <td className={`${showMedals ? rankToClass(rankByCol[5 + events.length]) : ''} left-border bold table-cell-large`}>{ftoa((performance as FullStudentPerformance).objs)}</td>}
                {hasSubs && <td className={`${showMedals ? rankToClass(rankByCol[6 + events.length]) : ''} table-cell-large`}>{ftoa((performance as FullStudentPerformance).subs)}</td>}
                {editingEnabled && <td><button onClick={() => setEditing(true)}>Edit</button></td>}
            </tr>
        )
    } else {
        return <StudentPerformanceEdit matchId={performance.matchId} performance={performance as FullStudentPerformance} teams={teams} events={events} index={0} teamNumber={teamNumber} callback={fetchData} />
    }
}

export default StudentPerformanceRow