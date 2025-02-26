import { Category } from "@prisma/client"
import { divisionsOrder, objs, roundOrder, subs } from "./consts.js"

export type CSVColumnDef = {
    name: string,
    type: 'string' | 'int' | 'float'
}

export type CSVParseResult = {
    success: boolean,
    message?: string,
    data?: { [colName: string]: string | number }[]
}

export const possiblyShorten = (str: string): string => {
    if (str.length > 20) {
        return str.slice(0, 16) + '...'
    }
    return str
}

export const rankToClass = (rank: number): string => {
    switch (rank) {
        case 1: return 'gold'
        case 2: return 'silver'
        case 3: return 'bronze'
        default: return ''
    }
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

export const roundSort = (a: string, b: string) => {
    return roundOrder.indexOf(a) - roundOrder.indexOf(b)
}

export const hasObjs = (events: Category[] | undefined): boolean => {
    return events != undefined && events.some(x => objs.indexOf(x) >= 0)
}

export const hasSubs = (events: Category[] | undefined): boolean => {
    return events != undefined && events.some(x => subs.indexOf(x) >= 0)
}

export const ftoa = (i: number | null | undefined) => i?.toLocaleString(undefined, { maximumFractionDigits: 2 })

export const parseCsv = (csvStr: string, cols: CSVColumnDef[]): CSVParseResult => {

    let result = []

    const lines = csvStr.split('\n')
    let i = 0
    for (const line of lines) {
        i += 1
        let lineResult: { [key: string]: string | number } = {}
        const lineSpl = line.split(',')
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
                if (!fl) {
                    return { success: false, message: `Row ${i} column ${j + 1} could not be parsed as decimal number` }
                }
                lineResult[cols[j].name] = fl
            } else {
                const integ = parseInt(lineSpl[j])
                if (!integ) {
                    return { success: false, message: `Row ${i} column ${j + 1} could not be parsed as integer` }
                }
                lineResult[cols[j].name] = integ
            }
        }
        result.push(lineResult)
    }

    return { success: true, data: result }
}