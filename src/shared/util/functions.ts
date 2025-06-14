import { Category, Prisma } from "@prisma/client"
import { divisionsOrder, friendlyGPA, friendlyRound, objs, roundOrder, subs } from "./consts.js"
import shimGroupBy from 'object.groupby'

export type CSVColumnDef = {
    name: string,
    type: 'string' | 'int' | 'float'
}

export type CSVParseResult = {
    success: boolean,
    message?: string,
    data?: { [colName: string]: string | number }[]
}

export const groupBy = <K extends PropertyKey, T>(arr: Iterable<T>, keySelector: (item: T, index: number) => K): Partial<Record<K, T[]>> => {
    if ('groupBy' in Object) {
        return Object.groupBy(arr, keySelector)
    } else {
        return shimGroupBy(arr, keySelector)
    }
}

export const possiblyShorten = (str: string): string => {
    if (str.length > 18) {
        return str.slice(0, 15) + '...'
    }
    return str
}

export const rankToClass = (rank: number | undefined): string => {
    switch (rank) {
        case 0: return 'gold'
        case 1: return 'silver'
        case 2: return 'bronze'
        default: return ''
    }
}

export const matchTitle = (match: Prisma.MatchGetPayload<{}>): string => {
    return `${match.year} ${friendlyRound[match.round]}`
}

export const matchSubtitle = (match: Prisma.MatchGetPayload<{ include: { state: true, region: true } }>): string => {
    return (match.round == 'nationals' && match.site) || ((match.round !== 'nationals') ? match.state?.name : '') + (match.round !== 'nationals' && match.round !== 'state' ? ', ' + match.region?.name : '')
}

export const diff = (oldObj: any, newObj: any): any => {
    let d: { [key: string]: { old: any, new: any } } = {}
    Object.keys(oldObj).forEach(key => {
        if (Array.isArray(oldObj[key])) {
            if (oldObj[key].length != newObj[key].length) {
                d[key] = { old: oldObj[key], new: newObj[key] }
            } else {
                for (let i = 0; i < oldObj[key].length; i++) {
                    if (oldObj[key][i] != newObj[key][i]) {
                        d[key] = { old: oldObj[key], new: newObj[key] }
                        break
                    }
                }
            }
        } else if (oldObj[key] instanceof Date) {
            if (oldObj[key].toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }) != newObj[key].toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })) {
                d[key] = { old: oldObj[key], new: newObj[key] }
            }
        } else {
            if (oldObj[key] != newObj[key]) {
                d[key] = { old: oldObj[key], new: newObj[key] }
            }
        }
    })

    return d
}

export const divisionSort = (a: string, b: string) => {
    return divisionsOrder.indexOf(a) - divisionsOrder.indexOf(b)
}

export const partitionsOrder = divisionsOrder.map(key => `_d${key}`).concat(Object.keys(friendlyGPA).sort().map(key => `_g${key}`)).concat(divisionsOrder.flatMap(div => Object.keys(friendlyGPA).sort().map(gpa => `_d${div}_g${gpa}`)))

export const partitionSort = (a: string, b: string) => {
    return partitionsOrder.indexOf(a) - partitionsOrder.indexOf(b)
}

export const roundSort = (a: string, b: string) => {
    return roundOrder.indexOf(a) - roundOrder.indexOf(b)
}

export const hasObjs = (events: Category[] | undefined, year: number | undefined): boolean => {
    return events != undefined && year != undefined && events.some(x => objs(year).indexOf(x) >= 0)
}

export const hasSubs = (events: Category[] | undefined): boolean => {
    return events != undefined && events.some(x => subs.indexOf(x) >= 0)
}

export const ftoa = (i: number | null | undefined, minimumFractionDigits: number = 1) => i?.toLocaleString(undefined, { maximumFractionDigits: 1, minimumFractionDigits })

export const parseCsv = (csvStr: string, cols: CSVColumnDef[]): CSVParseResult => {

    let result = []

    const lines = csvStr.split(/\r?\n/)
    let i = 0
    for (const line of lines) {
        i += 1
        let lineResult: { [key: string]: string | number } = {}
        const lineSpl = line.split(',')
        if (lineSpl.length < 2 && i == lines.length) {
            continue
        }
        if (lineSpl.length != cols.length) {
            return {
                success: false, message: `Row ${i} has len ${lineSpl.length}, expected ${cols.length}`
            }
        }
        for (let j = 0; j < cols.length; j++) {
            if (cols[j].type == 'string') {
                lineResult[cols[j].name] = lineSpl[j]
            } else if (cols[j].type == 'float') {
                const fl = parseFloat(lineSpl[j])
                if (!fl && fl != 0) {
                    return { success: false, message: `Row ${i} column ${j + 1} could not be parsed as decimal number` }
                }
                lineResult[cols[j].name] = fl
            } else {
                const integ = parseInt(lineSpl[j])
                if (!integ && integ != 0) {
                    return { success: false, message: `Row ${i} column ${j + 1} could not be parsed as integer` }
                }
                lineResult[cols[j].name] = integ
            }
        }
        result.push(lineResult)
    }

    return { success: true, data: result }
}