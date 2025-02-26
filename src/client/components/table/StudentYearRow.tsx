
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa } from "@/shared/util/functions"
import { Prisma } from "@prisma/client"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"

interface StudentYearRowProps extends TableRowProps {
    year: number,
    data: {
        roundone?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        regionals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        state?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        nationals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
    }
}

const StudentYearRow: React.FunctionComponent<StudentYearRowProps> = ({ year, data }) => {

    if (!data) {
        return (null)
    }

    const mostRecentSchool = data.nationals?.team.schoolId || data.state?.team.schoolId || data.regionals?.team.schoolId || data.roundone?.team.schoolId

    return (
        <tr key={year}>
            {mostRecentSchool || mostRecentSchool == 0 ? (
                <td className='is-link'><Link to={`/school/${mostRecentSchool}/season/${year}`}>{year}</Link></td>
            ) : (
                <td>{year}</td>
            )}
            {
                data.roundone ? (
                    <td className={`is-link`}><Link to={`/match/${data.roundone.matchId}?school=${data.roundone.team.schoolId}`}>{ftoa(data.roundone.overall)} ({data.roundone.gpa})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.regionals ? (
                    <td className={`is-link`}><Link to={`/match/${data.regionals.matchId}?school=${data.regionals.team.schoolId}`}>{ftoa(data.regionals.overall)} ({data.regionals.gpa})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.state ? (
                    <td className={`is-link`}><Link to={`/match/${data.state.matchId}?school=${data.state.team.schoolId}`}>{ftoa(data.state.overall)} ({data.state.gpa})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.nationals ? (
                    <td className={`is-link`}><Link to={`/match/${data.nationals.matchId}?school=${data.nationals.team.schoolId}`}>{ftoa(data.nationals.overall)} ({data.nationals.gpa})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
        </tr>
    )

}

export default StudentYearRow