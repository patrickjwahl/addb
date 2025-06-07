
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa, rankToClass } from "@/shared/util/functions"
import { Prisma } from "@prisma/client"
import { Link } from "react-router-dom"
import { TableRowProps } from "./Table"

interface StudentYearData {
    roundone?: Prisma.StudentPerformanceGetPayload<{ include: { team: true, match: true } }> & { rank?: number },
    regionals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true, match: true } }> & { rank?: number },
    state?: Prisma.StudentPerformanceGetPayload<{ include: { team: true, match: true } }> & { rank?: number },
    nationals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true, match: true } }> & { rank?: number },
}

interface StudentYearRowProps extends TableRowProps {
    year: number,
    data: StudentYearData
}

const StudentYearRow: React.FunctionComponent<StudentYearRowProps> = ({ year, data }) => {

    if (!data) {
        return (null)
    }

    const mostRecentSchool = data.nationals?.team.schoolId || data.state?.team.schoolId || data.regionals?.team.schoolId || data.roundone?.team.schoolId

    let cells = []
    for (const round of ['roundone', 'regionals', 'state', 'nationals'] as (keyof StudentYearData)[]) {
        let cell = data[round] && data[round].overall ? (
            <td className={`is-link ${rankToClass(data[round].rank) || ''}`}>
                <Link to={`/match/${data[round].matchId}?school=${data[round].team.schoolId}`}>
                    {ftoa(data[round].overall)} ({data[round].gpa})
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
            {mostRecentSchool || mostRecentSchool == 0 ? (
                <td className='is-link'><Link to={`/school/${mostRecentSchool}/season/${year}`}>{year}</Link></td>
            ) : (
                <td>{year}</td>
            )}
            {cells}
        </tr>
    )

}

export default StudentYearRow