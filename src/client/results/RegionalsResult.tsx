import api from "@/client/API"
import { Match } from "@/shared/types/response"
import { useCallback, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs } from "@/shared/util/functions"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import MatchTablesControl from "../components/MatchTablesControl"

export default function RegionalsResult() {

    const [data, setData] = useState<Match | null>()
    const [error, setError] = useState<string | null>(null)

    const params = useParams()
    const year = params.year
    const state = params.state?.replaceAll('_', ' ')

    const fetchRegionals = useCallback(async () => {
        const result = (await api.getRegionals(state || '', parseInt(year || '-1') || -1))
        if (!result?.success) {
            setError(result.message || 'An unexpected error occurred.')
            return
        }

        setData(result.data)
    }, [params.id])

    useEffect(() => {
        fetchRegionals()
    }, [year, state])

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
                <title>{`${year} Regionals - ${state} | AcDecDB`}</title>
            </Helmet>
            <div className='small-header'>AGGREGATION</div>
            <div className='info-page-header'>
                <div className="info-title">{year} Regionals</div>
                <div className='info-subtitle'><Link to={`/state/${state}`}>{state} (Overall)</Link></div>
                <MatchTablesControl matches={[{ match: data }]} refresh={fetchRegionals} startLoading={startLoading} />
            </div>
        </div >
    )
}