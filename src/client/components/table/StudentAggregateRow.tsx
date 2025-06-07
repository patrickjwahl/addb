import { StudentAggregate } from "@/shared/types/response"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, ftoa } from "@/shared/util/functions"
import { Category } from "@prisma/client"
import { useMemo } from "react"
import { TableRowProps } from "./Table"

interface StudentAggregateRowProps extends TableRowProps {
    data: StudentAggregate,
    events: Category[],
    year: number
}

const StudentAggregateRow: React.FunctionComponent<StudentAggregateRowProps> = ({ data: aggregate, events, year }) => {

    const redacted = events.length == 0

    const hasObjs = useMemo((): boolean => {
        return !redacted && _hasObjs(events, year)
    }, [events, redacted])

    const hasSubs = useMemo((): boolean => {
        return !redacted && _hasSubs(events)
    }, [events, redacted])

    if (!aggregate) {
        return (null)
    }

    const overall10 = aggregate['overall'] * (10.0 / events.length)

    return (
        <tr className='aggregate-row'>
            <td className='table-cell-large'></td>
            <td></td>
            <td className="table-cell-large"></td>
            <td className="bold"><i>Team Total</i></td>
            <td className={'bold'}><i>{ftoa(aggregate['overall'])}</i></td>
            {events.length < 10 && <td className="bold"><i>{ftoa(overall10)}</i></td>}
            {!redacted && events.map(event => (
                <td key={event} className="table-cell-small bold"><i>{ftoa(aggregate[event], 0)}</i></td>
            ))}
            {hasObjs && <td className="left-border bold table-cell-large"><i>{ftoa(aggregate['objs'])}</i></td>}
            {hasSubs && <td className="table-cell-large bold"><i>{ftoa(aggregate['subs'])}</i></td>}
        </tr>
    )
}

export default StudentAggregateRow