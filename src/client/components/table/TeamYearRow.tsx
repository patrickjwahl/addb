
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, rankToClass } from "@/shared/util/functions"
import { Prisma } from "@prisma/client"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"

interface TeamYearRowProps extends TableRowProps {
    year: number,
    data: {
        roundone?: Prisma.TeamPerformanceGetPayload<{}>,
        regionals?: Prisma.TeamPerformanceGetPayload<{}>,
        state?: Prisma.TeamPerformanceGetPayload<{}>,
        nationals?: Prisma.TeamPerformanceGetPayload<{}>,
    },
    schoolId: number
}

const TeamYearRow: React.FunctionComponent<TeamYearRowProps> = ({ year, data, schoolId }) => {

    if (!data) {
        return (null)
    }

    return (
        <tr key={year}>
            <td className='is-link'><Link to={`/school/${schoolId}/season/${year}`}>{year}</Link></td>
            {
                data.roundone ? (
                    <td className={`is-link ${rankToClass(data.roundone.rank - 1)}`}><Link to={`/match/${data.roundone.matchId}?school=${schoolId}`}>{ftoa(data.roundone.overall)} ({data.roundone.rank})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.regionals ? (
                    <td className={`is-link ${rankToClass(data.regionals.rank - 1)}`}><Link to={`/match/${data.regionals.matchId}?school=${schoolId}`}>{ftoa(data.regionals.overall)} ({data.regionals.rank})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.state ? (
                    <td className={`is-link ${rankToClass(data.state.rank - 1)}`}><Link to={`/match/${data.state.matchId}?school=${schoolId}`}>{ftoa(data.state.overall)} ({data.state.rank})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
            {
                data.nationals ? (
                    <td className={`is-link ${rankToClass(data.nationals.rank - 1)}`}><Link to={`/match/${data.nationals.matchId}?school=${schoolId}`}>{ftoa(data.nationals.overall)} ({data.nationals.rank})</Link></td>
                ) : (
                    <td>-</td>
                )
            }
        </tr>
    )

}

export default TeamYearRow