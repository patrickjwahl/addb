import api from "@/client/API"
import { Match } from "@/shared/types/response"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { hasObjs as _hasObjs, hasSubs as _hasSubs } from "@/shared/util/functions"
import { friendlyRound, } from "@/shared/util/consts"
import { ColorRing } from "react-loader-spinner"
import { Helmet } from "react-helmet"
import MatchPropertiesEdit from "@/client/components/edit/MatchPropertiesEdit"
import MatchTablesControl from "../components/MatchTablesControl"

export default function MatchResult2() {

    const [match, setMatch] = useState<Match>()
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isDeleted, setIsDeleted] = useState<boolean>(false)

    const params = useParams()

    const fetchMatch = useCallback(async () => {
        const result = (await api.getMatch(params.id || ''))
        if (!result.success) {
            setError(result.message || 'An unexpected error occurred.')
            return
        }

        setMatch(result.data)
    }, [params.id])

    useEffect(() => {
        fetchMatch()
    }, [params.id])

    const canEdit = useMemo(() => api.canEdit(), [])
    const toggleEditMode = () => {
        setEditing(!editing)
    }

    const deleteMatch = async () => {
        if (match && window.confirm("Are you very sure?")) {
            const result = await api.deleteMatch(match.id)
            if (!result.success) {
                alert(result.message)
            } else {
                setIsDeleted(true)
            }
        }
    }

    const startLoading = useCallback(() => { setMatch(null) }, [])

    if (error) {
        return <div className='error-message'>{error}</div>
    }

    if (!match) {
        return <ColorRing
            height={40}
            width={40}
            wrapperStyle={{ marginTop: '50px' }}
            visible
        />
    }

    let subtitle = ''
    if (match.state) {
        subtitle = match.state?.name
    }
    if (match.region) {
        subtitle += `, ${match.region.name}`
    }

    let thirdTitle
    if (match.date && match.site) {
        thirdTitle = `${new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })} - ${match.site}`
    } else if (match.date) {
        thirdTitle = new Date(match.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })
    } else if (match.site) {
        thirdTitle = match.site
    } else {
        thirdTitle = ''
    }

    if (isDeleted) return <img src="/img/chigurh.jpg" />

    return (
        <div className='info-page'>
            <Helmet>
                <title>{`${match.year} ${friendlyRound[match.round]} - ${subtitle} | AcDecDB`}</title>
            </Helmet>
            <div className='small-header'>MATCH</div>
            <div className='info-page-header'>
                {editing ? <MatchPropertiesEdit match={match} callback={fetchMatch} /> : (
                    <>
                        <div className='info-title'>{match.year} {friendlyRound[match.round]}</div>
                        <div className='info-subtitle'>{subtitle}</div>
                        <div className='info-third-title'>{thirdTitle}</div>
                        {match.note && <div className="info-note">{match.note}</div>}
                    </>
                )}
                {canEdit &&
                    <div className='header-edit-buttons'>
                        <button className="admin-button" onClick={toggleEditMode}>{editing ? 'Leave Editing Mode' : 'Edit'}</button>
                        <button className="admin-button" onClick={deleteMatch}>Delete</button>
                    </div>
                }
                <MatchTablesControl matches={[{ match: match }]} editing={editing} refresh={fetchMatch} startLoading={startLoading} />
            </div>
        </div >
    )
}