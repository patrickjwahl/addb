import api from "@/client/API"
import { SchoolSeasonPage } from "@/shared/types/response"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs } from "@/shared/util/functions"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import MatchTablesControl from "../components/MatchTablesControl"
import { friendlyRound } from "@/shared/util/consts"

export default function SeasonResult2() {

    const [data, setData] = useState<SchoolSeasonPage | null>()
    const [error, setError] = useState<string | null>(null)

    const params = useParams()
    const year = params.year

    const fetchSeason = useCallback(async () => {
        const result = (await api.getSeason(parseInt(params.id || '-1') || -1, parseInt(year || '-1') || -1))
        if (!result?.success || result.data?.matches.some(match => !match)) {
            setError(result.message || 'An unexpected error occurred.')
            return
        }

        setData(result.data)
    }, [params.id])

    useEffect(() => {
        fetchSeason()
    }, [params.id])

    const startLoading = useCallback(() => { setData(null) }, [])

    if (error) {
        return <div className='error-message'>{error}</div>
    }

    if (!data) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    return (
        <div className='info-page'>
            <Helmet>
                <title>{`${year} Season - ${data.school.fullName} | AcDecDB`}</title>
            </Helmet>
            <div className='small-header'>MATCH</div>
            <div className='info-page-header'>
                <div className='info-title'><Link to={`/school/${data.school.id}`}>{data.school.fullName}</Link></div>
                <div className='info-subtitle'>{year} Season</div>
                <MatchTablesControl matches={data.matches.filter(match => match != null).sort((a, b) => (a?.date || 0) > (b?.date || 0) ? -1 : 1).map(match => ({ title: friendlyRound[match.round], match: match }))} initSchoolFilter={data.school.id} refresh={fetchSeason} startLoading={startLoading} />
            </div>
        </div >
    )
}