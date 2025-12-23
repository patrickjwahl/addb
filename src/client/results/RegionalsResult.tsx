import api from "@/client/API"
import { RegionalsAggregate } from "@/shared/types/response"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs, regionSort } from "@/shared/util/functions"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import MatchTablesControl from "../components/MatchTablesControl"

export default function RegionalsResult() {

    const [data, setData] = useState<RegionalsAggregate | null>()
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

        console.log('hey')
        console.log(result.data?.teamIdToRegion)
        setData(result.data)
    }, [params.id])

    useEffect(() => {
        fetchRegionals()
    }, [year, state])

    const startLoading = useCallback(() => { setData(null) }, [])
    const matches = useMemo(() => {
        if (!data) return []
        return data.matches.sort((a, b) => {
            return regionSort(a.region, b.region)
        })
    }, [data])

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
                <div className="roster-container" style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '12px', fontSize: '12px', padding: '5px', justifyContent: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>Individual Matches:</div>
                    {
                        matches.map(match => {
                            return (
                                <Link to={`/match/${match.id}`}><div>{match.region}</div></Link>
                            )
                        })
                    }
                </div>
                <MatchTablesControl matches={[{ match: data }]} refresh={fetchRegionals} startLoading={startLoading} teamIdToRegion={data.teamIdToRegion} />
            </div>
        </div >
    )
}