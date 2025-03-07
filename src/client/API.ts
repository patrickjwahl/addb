import axios, { AxiosInstance } from 'axios'
import { ApiResponse, EditResult, FullState, FullStudentPerformance, LoginResult, Match, MatchPreviews, MergeSuggestion, SchoolPage, SchoolSeasonPage, SearchResult, SearchResultSchool, SearchResultStudent, StudentLeaderboard, StudentPage, TeamLeaderboard, TeamPerformance } from '@/shared/types/response'
import { CreateUserCredentials, MatchMetadata, SchoolMetadata, StudentMetadata, StudentPerformance, TeamPerformance as TeamPerformanceRequest } from '../shared/types/request'
import { StateMatches } from '../shared/types/response'

class API {

    axios: AxiosInstance

    constructor() {
        this.axios = axios.create({
            baseURL: '/api'
        })
    }

    logIn = async (username: string, password: string): Promise<ApiResponse<LoginResult> | null | undefined> => {
        const result: ApiResponse<LoginResult> = (await this.axios.post('/login', {
            username: username,
            password: password
        })).data

        if (!result.success || !result.data) {
            this.logOut()
            return result
        }

        localStorage.setItem('expiresAt', (result.data.expiresIn + new Date().getTime()).toString())
        localStorage.setItem('canEdit', result.data.canEdit.toString())
        localStorage.setItem('access', result.data.access.toString())
        localStorage.setItem('username', result.data.username)
        return result
    }


    upsertUser = async (data: CreateUserCredentials): Promise<ApiResponse<null>> => {
        return (await this.axios
            .post('/user', data)).data
    }

    logOut = () => {
        localStorage.removeItem('expiresAt')
        localStorage.removeItem('access')
        localStorage.removeItem('canEdit')
        localStorage.removeItem('username')
        this.axios.get('/logout')
    }

    accessLevel = () => {
        if (this.isLoggedIn()) {
            let level = localStorage.getItem('access')
            if (level) return parseInt(level)
        }
        return 1
    }

    username = () => {
        if (this.isLoggedIn()) {
            let uname = localStorage.getItem('username')
            if (uname) return uname
        }
        return '???'
    }

    authenticate = async (): Promise<ApiResponse<null>> => {
        return (await this.axios.get('/authenticate')).data
    }

    isLoggedIn = () => {
        let expiresAt = localStorage.getItem('expiresAt')
        if (expiresAt && new Date().getTime() < parseInt(expiresAt)) {
            return true
        }
        this.logOut()
        return false
    }

    canEdit = () => {
        let canEdit = localStorage.getItem('canEdit')
        if (canEdit === 'true') {
            return true
        }
        return false
    }

    search = async (query: string, limit: number): Promise<ApiResponse<SearchResult | null | undefined>> => {
        return (await (this.axios.get(`/search?query=${query}&limit=${limit}`))).data
    }

    uploadTeamPerformances = async (matchId: number, formData: FormData): Promise<ApiResponse<null | undefined>> => {
        return (await this.axios.post(`/match/${matchId}/teamcsv`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data; charset=utf-8'
            }
        })).data
    }

    uploadStudentPerformances = async (matchId: number, formData: FormData): Promise<ApiResponse<null | undefined>> => {
        return (await this.axios.post(`/match/${matchId}/studentcsv`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data; charset=utf-8'
            }
        })).data
    }

    getNationalsResults = async (maxYears: number | undefined): Promise<ApiResponse<null | MatchPreviews>> => {
        let endpoint = '/nationals'
        if (maxYears) endpoint += `?limit=${maxYears}`
        return (await this.axios.get(endpoint)).data
    }

    getStudentLeaderboard = async (): Promise<ApiResponse<null | StudentLeaderboard>> => {
        return (await this.axios.get('/season_top_students')).data
    }

    getTeamLeaderboard = async (): Promise<ApiResponse<null | TeamLeaderboard>> => {
        return (await this.axios.get('/season_top_teams')).data
    }

    getTeamPerformance = async (id: number): Promise<ApiResponse<null | undefined | TeamPerformance>> => {
        return (await this.axios.get(`/teamperformance/${id}`)).data
    }

    getStudentPerformance = async (id: number): Promise<ApiResponse<null | undefined | FullStudentPerformance>> => {
        return (await this.axios.get(`/studentperformance/${id}`)).data
    }

    upsertStudentPerformance = async (data: StudentPerformance): Promise<ApiResponse<null | undefined>> => {
        return (await this.axios.post('/studentperformance', data)).data
    }

    upsertTeamPerformance = async (data: TeamPerformanceRequest): Promise<ApiResponse<null | undefined>> => {
        return (await this.axios.post('/teamperformance', data)).data
    }

    upsertMatch = async (data: MatchMetadata): Promise<ApiResponse<number | null | undefined>> => {
        return (await (this.axios.post('/match', data))).data
    }

    upsertSchool = async (data: SchoolMetadata): Promise<ApiResponse<null | undefined | SearchResultSchool>> => {
        return (await this.axios.post('/school', data)).data
    }

    upsertStudent = async (data: StudentMetadata): Promise<ApiResponse<null | undefined | SearchResultStudent>> => {
        return (await this.axios.post('/student', data)).data
    }

    getSchool = async (id: number): Promise<ApiResponse<null | undefined | SchoolPage>> => {
        return (await this.axios.get(`/school/${id}`)).data
    }

    getStudent = async (id: number): Promise<ApiResponse<null | undefined | StudentPage>> => {
        return (await this.axios.get(`/student/${id}`)).data
    }

    mergePeople = async (godId: number, peonId: number): Promise<ApiResponse<null | undefined>> => {
        return (await this.axios.post(`/mergepeople/${godId}/${peonId}`)).data
    }

    getEdits = async (id: number | null): Promise<ApiResponse<null | undefined | EditResult[]>> => {
        let path = '/edits'
        id && (path += `?cursor=${id}`)
        return (await this.axios.get(path)).data
    }

    getMatch = async (id: string): Promise<ApiResponse<Match>> => {
        let endpoint = `/match/${id}`
        return (await this.axios.get(endpoint)).data
    }

    getSeason = async (id: number, year: number): Promise<ApiResponse<SchoolSeasonPage>> => {
        let endpoint = `/school/${id}/season/${year}`
        return (await this.axios.get(endpoint)).data
    }

    // getMatchSpecific = (round, region, state, year) => {
    //     return this.axios.get(`/match/${round}/${state ? state + '/' : ''}${region ? region + '/' : ''}${year}`)
    // }

    getRecentMatches = async (): Promise<ApiResponse<MatchPreviews | null>> => {
        return (await this.axios.get('/recent')).data
    }

    getStateResults = async (state: string): Promise<ApiResponse<StateMatches>> => {
        return (await this.axios.get(`/state/${state}`)).data
    }

    deleteMatch = async (id: number): Promise<ApiResponse<null>> => {
        return (await this.axios.delete(`/match/${id}`)).data
    }

    deleteSchool = async (id: number): Promise<ApiResponse<null>> => {
        return (await this.axios.delete(`/school/${id}`)).data
    }

    deleteStudent = async (id: number): Promise<ApiResponse<null>> => {
        return (await this.axios.delete(`/student/${id}`)).data
    }

    getPotentialMerges = async (state: string): Promise<ApiResponse<MergeSuggestion[]>> => {
        return (await this.axios.get(`/potentialmerges/${state}`)).data
    }

    getStates = async (): Promise<ApiResponse<FullState[]>> => {
        return (await this.axios.get('/states')).data
    }
}

const api = new API()
export default api