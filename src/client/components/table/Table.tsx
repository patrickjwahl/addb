import { ReactEventHandler, useRef } from "react"
import { Tooltip } from "react-tooltip"

export interface TableRowProps {
    data: any
}

export type Column = {
    name: string,
    sortingAllowed: boolean,
    tip?: string,
    leftBorder?: boolean,
    rightBorder?: boolean
}

interface TableProps {
    children: React.ReactElement<any, typeof _TableRow>[],
    columns: Column[],
    setSort?: (index: number) => void,
    sortIndex?: number,
    sortDesc?: boolean
}

// Base TableRow component (abstract class equivalent)
const _TableRow: React.FunctionComponent<TableRowProps> = ({ data }) => {
    return (<tr><td>{JSON.stringify(data)}</td></tr>)
}

export default function Table({ children, columns, setSort, sortIndex, sortDesc = true }: TableProps) {

    const scrollable = children.length > 25
    const tableUUID = crypto.randomUUID()
    const tableRef = useRef(null)

    const handleMouseOver: ReactEventHandler<HTMLTableElement> = e => {
        let target = e.target as HTMLElement
        while (target.tagName !== 'TD' && target.parentElement) {
            target = target.parentElement
        }
        if (target.tagName === 'TD') {
            const cell = target as HTMLTableCellElement
            const index = cell.cellIndex
            if (tableRef.current) {
                (tableRef.current as HTMLTableElement).querySelectorAll('thead tr').forEach(row => {
                    (row as HTMLTableRowElement).cells[index]?.classList.add('highlight-col')
                })
            }
        }
    }

    const handleMouseOut: ReactEventHandler<HTMLTableElement> = e => {
        if (tableRef.current) {
            (tableRef.current as HTMLTableElement).querySelectorAll('th.highlight-col').forEach(cell => {
                cell.classList.remove('highlight-col')
            })
        }
    }

    return (
        <div className={'table-wrapper' + (scrollable ? ' table-fix-head' : '')}>
            {columns.map((col, index) => {
                return col.tip ? <Tooltip id={`${tableUUID}-${index}`}>{col.tip}</Tooltip> : (null)
            })}
            <table ref={tableRef} className="info-page-table" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
                <thead>
                    <tr className="info-page-table-first-row">
                        {columns.map((col, index) => {
                            return (
                                <th data-tooltip-id={`${tableUUID}-${index}`} key={index} className={col.sortingAllowed ? 'with-cursor' : ''} onClick={() => col.sortingAllowed && setSort && setSort(index)}>
                                    {col.name}{(sortIndex != undefined && index == sortIndex) && (!sortDesc ? ' ▲' : ' ▼')}
                                </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    {children}
                </tbody>
            </table>
        </div>
    )
}