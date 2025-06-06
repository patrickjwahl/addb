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

    return (
        <div className={'table-wrapper' + (scrollable ? ' table-fix-head' : '')}>
            <table className="info-page-table">
                <thead>
                    <tr className="info-page-table-first-row">
                        {columns.map((col, index) => {
                            return (
                                <th title={col.tip} key={index} className={col.sortingAllowed ? 'with-cursor' : ''} onClick={() => col.sortingAllowed && setSort && setSort(index)}>
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