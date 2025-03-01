import { Prisma, Round } from "@prisma/client"

export type ApiResponse<T> = {
    success: boolean,
    data?: T | null,
    message?: string
}

export type LoginResult = {
    expiresIn: number,
    canEdit: boolean,
    access: number,
    username: string
}

export type EditResult = Prisma.EditGetPayload<{
    include: {
        user: true
    }
}>

export type MergeSuggestion = {
    teamName: string,
    student1: Prisma.StudentGetPayload<{}>,
    student2: Prisma.StudentGetPayload<{}>,
    seen?: boolean
}

export type RecentMatches = Array<Prisma.MatchGetPayload<{
    include: { region: true, state: true }
}>> | undefined

export type FullState = Prisma.StateGetPayload<{
    include: {
        regions: true
    }
}>

export type StateMatches = {
    id: number,
    year: number,
    round: Round,
    region?: string,
    first: string,
    firstScore: number,
    second: string,
    secondScore: number,
    third: string,
    thirdScore: number
}[] | undefined

export type SchoolSeasonRound = {
    studentPerformances: StudentPerformance[],
    teamPerformances: TeamPerformance[],
    aggregates: StudentAggregates
    match: Prisma.MatchGetPayload<{}>
}
export type SchoolSeasonPage = {
    roundone?: SchoolSeasonRound
    regionals?: SchoolSeasonRound
    state?: SchoolSeasonRound
    nationals?: SchoolSeasonRound,
    school: Prisma.SchoolGetPayload<{}>
}

export type StudentAggregate = { [category: string]: number }
export type StudentAggregates = { [team: number]: StudentAggregate }

export type TeamPerformance = Prisma.TeamPerformanceGetPayload<{
    include: {
        team: {
            include: {
                school: true
            }
        }
    }
}>

export type StudentPerformance = FullStudentPerformance | RedactedStudentPerformance

export type FullStudentPerformance = Prisma.StudentPerformanceGetPayload<{
    include: {
        team: true,
        student: true
    }
}>

export type RedactedStudentPerformance = Prisma.StudentPerformanceGetPayload<{
    select: {
        student: true,
        studentId: true,
        id: true,
        teamId: true,
        team: true,
        gpa: true,
        overall: true,
        matchId: true
    }
}>

export type Match = ({ aggregates?: StudentAggregates } & (FullMatch | RedactedMatch)) | null

export type RedactedMatch = Prisma.MatchGetPayload<{
    include: {
        teamPerformances: {
            include: {
                team: {
                    include: {
                        school: true
                    }
                }
            }
        }, studentPerformances: {
            select: {
                student: true,
                studentId: true,
                teamId: true,
                id: true,
                team: true,
                gpa: true,
                overall: true,
                matchId: true
            }
        },
        region: true,
        state: true
    }
}> | undefined

export type FullMatch = Prisma.MatchGetPayload<{
    include: {
        teamPerformances: {
            include: {
                team: {
                    include: {
                        school: true
                    }
                }
            }
        },
        studentPerformances: {
            include: {
                student: true,
                team: true
            }
        },
        region: true,
        state: true
    }
}> | undefined

export type SearchResult = {
    schools: SearchResultSchool[],
    students: SearchResultStudent[],
    matches: SearchResultMatch[]
}

export type SearchResultStudent = Prisma.StudentGetPayload<{
    include: {
        performances: {
            select: {
                team: {
                    select: {
                        school: {
                            include: {
                                state: true
                            }
                        }
                    }
                }
            }
        }
    }
}>

export type SearchResultMatch = Prisma.MatchGetPayload<{
    select: {
        id: true,
        year: true,
        round: true,
        state: true,
        region: true
    }
}>

export type SearchResultSchool = Prisma.SchoolGetPayload<{
    include: {
        region: true,
        state: true
    }
}>

export type SchoolTeam = {
    team: Prisma.TeamGetPayload<{}>,
    seasons: TeamSeasons,
}
export type TeamSeasons = {
    [year: number]: {
        roundone?: Prisma.TeamPerformanceGetPayload<{}>,
        regionals?: Prisma.TeamPerformanceGetPayload<{}>,
        state?: Prisma.TeamPerformanceGetPayload<{}>,
        nationals?: Prisma.TeamPerformanceGetPayload<{}>,
    }
}
export type SchoolPage = {
    school: Prisma.SchoolGetPayload<{
        include: {
            region: true,
            state: true
        }
    }>,
    teams: SchoolTeam[],
    rosters: {
        [year: number]: Prisma.StudentGetPayload<{}>[]
    }
}

export type StudentSeasons = {
    [year: number]: {
        roundone?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        regionals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        state?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>,
        nationals?: Prisma.StudentPerformanceGetPayload<{ include: { team: true } }>
    }
}
export type StudentPage = {
    student: Prisma.StudentGetPayload<{}>,
    seasons: StudentSeasons,
    school?: Prisma.SchoolGetPayload<{
        include: {
            state: true
        }
    }> | null
}
