import { FullStudentPerformance, StudentPerformance } from "@/shared/types/response"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, possiblyShorten, rankToClass } from "@/shared/util/functions"
import { Category } from "@prisma/client"
import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"
import StudentPerformanceEdit from "../edit/StudentPerformanceEdit"
import api from "@/client/API"
import { Tooltip } from "react-tooltip"

interface StudentPerformanceRowProps extends TableRowProps {
    data: StudentPerformance,
    teamRank: number,
    editingEnabled: boolean,
    events: Category[],
    teams: Array<{
        name: string,
        id: number
    }>,
    rank?: number,
    rankByCol: { [index: number]: number },
    showMedals: boolean,
    editCallback?: () => void
}

const StudentPerformanceRow: React.FunctionComponent<StudentPerformanceRowProps> = ({ data: performance, teamRank, editCallback, editingEnabled, events, teams, rank, rankByCol, showMedals }) => {

    const [editing, setEditing] = useState(false)

    const redacted = events.length == 0

    const canEdit = useMemo(() => api.canEdit(), [])

    const fetchData = async () => {
        const result = (await api.getStudentPerformance(performance.id))
        if (result.success) {
            setEditing(false)
            editCallback && editCallback()
        }
    }

    if (!editingEnabled && editing) {
        setEditing(false)
    }

    const rowUUID = crypto.randomUUID()

    const hasObjs = useMemo((): boolean => {
        return !redacted && _hasObjs(events, performance.match.year)
    }, [events, redacted])

    const hasSubs = useMemo((): boolean => {
        return !redacted && _hasSubs(events)
    }, [events, redacted])

    if (!performance) {
        return (null)
    }

    if (!editing) {
        const shortenedTeamName = possiblyShorten(performance.team.name)
        const shortenedStudentName = possiblyShorten(performance.student?.name || '')
        return (
            <tr key={performance.id} className={(canEdit && !performance.studentId ? 'row-warning' : '')}>
                {
                    (rank != undefined) && <td className="table-cell-small">{rank + 1}</td>
                }
                {
                    performance.team.schoolId ? (
                        <td className='is-link table-cell-large' data-tooltip-id={`${rowUUID}-team`} data-tooltip-class-name="tooltip">
                            <Link to={`/school/${performance.team.schoolId}`}>{shortenedTeamName}</Link>
                            {shortenedTeamName.endsWith('...') && <Tooltip id={`${rowUUID}-team`}>{performance.team.name}</Tooltip>}
                        </td>
                    ) : (
                        <td className="table-cell-large" data-tooltip-id={`${rowUUID}-team`} data-tooltip-class-name="tooltip">
                            {shortenedTeamName}
                            {shortenedTeamName.endsWith('...') && <Tooltip id={`${rowUUID}-team`}>{performance.team.name}</Tooltip>}
                        </td>
                    )
                }
                <td className="right-border">{teamRank}</td>
                <td className="is-link table-cell-large" data-tooltip-id={`${rowUUID}-student`} data-tooltip-class-name="tooltip">
                    <Link to={`/student/${performance.studentId}`}>{shortenedStudentName}</Link>
                    {shortenedStudentName.endsWith('...') && <Tooltip id={`${rowUUID}-student`}>{performance.student?.name}</Tooltip>}
                </td>
                <td>{performance.gpa}</td>
                <td className={'bold ' + (!redacted ? 'right-border ' : '') + (showMedals ? rankToClass(rankByCol[4]) : '')}>{ftoa(performance.overall)}</td>
                {!redacted && events.length < 10 &&
                    <td className={'bold ' + (showMedals ? rankToClass(rankByCol[4]) : '')}>{performance.overall != null ? ftoa(performance.overall * (10.0 / (events.length))) : null}</td>
                }
                {!redacted && events.map((event, index) => (
                    <td key={event} className={`table-cell-small ${showMedals ? rankToClass(rankByCol[5 + index]) : ''}`} title={performance.id == 104359 && event == 'speech' ? 'Commendable job, Raffi.' : ''}>{ftoa((performance as FullStudentPerformance)[event], 0)}</td>
                ))}
                {hasObjs && <td className={`${showMedals ? rankToClass(rankByCol[5 + events.length]) : ''} left-border bold table-cell-large`}>{ftoa((performance as FullStudentPerformance).objs)}</td>}
                {hasSubs && <td className={`${showMedals ? rankToClass(rankByCol[6 + events.length]) : ''} table-cell-large`}>{ftoa((performance as FullStudentPerformance).subs)}</td>}
                {editingEnabled && <td><button onClick={() => setEditing(true)}>Edit</button></td>}
            </tr>
        )
    } else {
        return <StudentPerformanceEdit matchId={performance.matchId} performance={performance as FullStudentPerformance} year={performance.match.year} teams={teams} events={events} rank={rank} teamRank={teamRank} callback={fetchData} />
    }
}

export default StudentPerformanceRow