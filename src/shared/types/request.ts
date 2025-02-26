import { Prisma } from "@prisma/client"

export type LoginCredentials = {
    username: string,
    password: string
}

export type CreateUserCredentials = {
    id?: number,
    password?: string,
    username: string,
    access: number,
    canEdit: boolean
}

export type MatchMetadata = Prisma.MatchGetPayload<{
    select: {
        year: true,
        round: true,
        date: true,
        site: true,
        hasSq: true,
        hasDivisions: true,
        access: true,
        events: true
    }
}> & { id?: number, stateId?: number, regionId?: number, newRegion?: string }

export type StudentPerformance = Prisma.StudentPerformanceGetPayload<{
    select: {
        teamId: true,
        studentId: true,
        gpa: true,
        overall: true,
        matchId: true
    }
}> & {
    id?: number,
    math?: number | null,
    music?: number | null,
    econ?: number | null,
    science?: number | null,
    lit?: number | null,
    art?: number | null,
    socialScience?: number | null,
    essay?: number | null,
    speech?: number | null,
    interview?: number | null,
    objs?: number | null,
    subs?: number | null
}

export type TeamPerformance = {
    id?: number,
    rank: number,
    schoolId: number,
    teamName: string,
    overall: number,
    objs: number,
    subs: number,
    division: string,
    sq?: number,
    matchId: number
}

export type SchoolMetadata = {
    id?: number,
    name: string,
    fullName?: string,
    city?: string,
    district?: string,
    info?: string,
    regionId?: number
}

export type StudentMetadata = {
    id?: number,
    name: string
}