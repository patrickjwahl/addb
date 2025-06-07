
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, rankToClass } from "@/shared/util/functions"
import { Prisma } from "@prisma/client"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"

interface TeamYearData {
    roundone?: Prisma.TeamPerformanceGetPayload<{ include: { match: true } }>,
    regionals?: Prisma.TeamPerformanceGetPayload<{ include: { match: true } }>,
    state?: Prisma.TeamPerformanceGetPayload<{ include: { match: true } }>,
    nationals?: Prisma.TeamPerformanceGetPayload<{ include: { match: true } }>
}

interface TeamYearRowProps extends TableRowProps {
    year: number,
    data: TeamYearData,
    schoolId: number
}

const TeamYearRow: React.FunctionComponent<TeamYearRowProps> = ({ year, data, schoolId }) => {

    if (!data) {
        return (null)
    }

    let cells = []
    for (const round of ['roundone', 'regionals', 'state', 'nationals'] as (keyof TeamYearData)[]) {
        let cell = data[round] && data[round].overall ? (
            <td className={`is-link ${rankToClass(data[round].rank - 1) || ''}`}>
                <Link to={`/match/${data[round].matchId}?school=${schoolId}`}>
                    {ftoa(data[round].overall)} ({data[round].rank})
                    {data[round].match.events.length < 10 &&
                        <>
                            <br />
                            <span className="small-font">{ftoa(data[round].overall * (10.0 / data[round].match.events.length))} ({data[round].match.events.length} → 10)</span>
                        </>
                    }
                </Link>
            </td>
        ) : (
            <td>-</td>
        )
        cells.push(cell)
    }

    return (
        <tr key={year}>
            <td className='is-link'><Link to={`/school/${schoolId}/season/${year}`}>{year}</Link></td>
            {cells}
        </tr>
    )

}

export default TeamYearRow