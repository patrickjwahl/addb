import SchoolSelect from "@/client/admin/SchoolSelect"
import api from "@/client/API"
import { TeamPerformance as TeamPerformanceRequest } from "@/shared/types/request"
import { Match, SearchResultSchool, TeamPerformance } from "@/shared/types/response"
import { divisions } from "@/shared/util/consts"
import { useState } from "react"

export default function TeamPerformanceEdit({ performance, hasSq, callback, match }:
    { performance?: TeamPerformance, hasSq: boolean, callback: () => void, match?: Match }) {
    const [rank, setRank] = useState(performance?.rank.toString() || '0')
    const [schoolId, setSchoolId] = useState(performance?.team.schoolId)
    const [newSchool, setNewSchool] = useState<SearchResultSchool | null>(null)
    const [teamName, setTeamName] = useState(performance?.team.name || '')
    const [overall, setOverall] = useState(performance?.overall?.toString() || '0')
    const [objs, setObs] = useState(performance?.objs?.toString() || '0')
    const [subs, setSubs] = useState(performance?.subs?.toString() || '0')
    const [sq, setSq] = useState(performance?.sq?.toString())
    const [division, setDivision] = useState(performance?.division || 'null')

    const [validationError, setValidationError] = useState<string | null>(null)

    const validateInput = (): string | null => {
        if (!parseFloat(overall)) {
            return "overall must be a number"
        }
        if (!parseFloat(objs)) {
            return "objs must be a number"
        }
        if (!parseFloat(subs)) {
            return "subs must be a number"
        }
        if (sq && !parseFloat(sq)) {
            return "sq must be a number"
        }
        if (!parseFloat(rank)) {
            return "rank must be a number"
        }

        if (!schoolId) {
            return "You must select a school"
        }
        if (!teamName) {
            return "Team name cannot be blank"
        }

        return null
    }

    const submitEdits = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        setValidationError(null)
        const err = validateInput()
        if (err) {
            setValidationError(err)
            return
        }

        if (!overall || !objs || !subs || !performance?.matchId || !schoolId) return

        const data: TeamPerformanceRequest = {
            id: performance?.id,
            overall: parseFloat(overall),
            objs: parseFloat(objs),
            subs: parseFloat(subs),
            division: division,
            sq: (sq) ? parseFloat(sq) : undefined,
            matchId: performance?.matchId,
            rank: parseInt(rank || '0'),
            schoolId: schoolId,
            teamName: teamName
        }

        const result = await api.upsertTeamPerformance(data)
        if (!result.success) {
            alert(result.message)
        } else {
            callback()
        }
    }

    const selectSchool = (school: SearchResultSchool) => {
        setNewSchool(school)
        setSchoolId(school.id)
    }

    const unselectSchool = () => {
        setNewSchool(null)
        setSchoolId(performance?.team.schoolId)
    }

    return (
        <>
            <tr>
                <td>
                    <input type="text" size={4} value={rank} onChange={e => setRank(e.target.value)} />
                </td>
                <td className="is-link table-cell-large">
                    <div>
                        <SchoolSelect currentName={performance?.team.school?.fullName || performance?.team.name || ''} selectedSchool={newSchool} selectSchool={selectSchool} unselectSchool={unselectSchool} match={match} />
                    </div>
                    <div>
                        <label>
                            Team name:
                            <input style={{ marginLeft: 10 }} type="text" value={teamName} onChange={e => setTeamName(e.target.value)} />
                        </label>
                    </div>
                </td>
                <td>
                    <input type="text" size={8} value={overall} onChange={e => setOverall(e.target.value)} />
                </td>
                <td className="table-cell-large">
                    <input type="text" size={8} value={objs} onChange={e => setObs(e.target.value)} />
                </td>
                <td className="table-cell-large">
                    <input type="text" size={8} value={subs} onChange={e => setSubs(e.target.value)} />
                </td>
                {hasSq && <td className="table-cell-large">
                    <input type="text" size={8} value={sq} onChange={e => setSq(e.target.value)} />
                </td>}
                <td>
                    <select value={division} onChange={e => setDivision(e.target.value)}>
                        {
                            Object.keys(divisions).map(div => (
                                <option key={div} value={div}>{div == 'null' ? '' : div}</option>
                            ))
                        }
                    </select>
                </td>
                <td>
                    <button className="green-save-button" onClick={submitEdits}>Save</button>
                </td>
            </tr>
            {validationError &&
                <tr>
                    <td style={{ backgroundColor: 'yellow' }} colSpan={100}>{validationError}</td>
                </tr>}
        </>
    )
}