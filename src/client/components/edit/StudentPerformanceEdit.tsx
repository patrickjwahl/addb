import PersonSelect from "@/client/admin/PersonSelect"
import api from "@/client/API"
import { StudentPerformance } from "@/shared/types/request"
import { FullStudentPerformance, SearchResultStudent } from "@/shared/types/response"
import { hasObjs, hasSubs } from "@/shared/util/functions"
import { Category } from "@prisma/client"
import { useState } from "react"

export default function StudentPerformanceEdit({ performance, events, teams, teamNumber, matchId, rank, callback }:
    {
        performance?: FullStudentPerformance, teamNumber: number, events: Category[], matchId: number, teams: Array<{ id: number, name: string }>, rank?: number,
        callback: () => void
    }) {
    const [teamId, setTeamId] = useState(performance?.teamId || (teams.length > 0 && teams[0].id) || 'null')
    const [gpa, setGpa] = useState(performance?.gpa || 'H')
    const [studentId, setStudentId] = useState(performance?.studentId)
    const [newStudent, setNewStudent] = useState<SearchResultStudent | null>(null)
    const [overall, setOverall] = useState(performance?.overall?.toString())
    const [math, setMath] = useState(performance?.math?.toString())
    const [music, setMusic] = useState(performance?.music?.toString())
    const [econ, setEcon] = useState(performance?.econ?.toString())
    const [science, setScience] = useState(performance?.science?.toString())
    const [lit, setLit] = useState(performance?.lit?.toString())
    const [art, setArt] = useState(performance?.art?.toString())
    const [socialScience, setSocialScience] = useState(performance?.socialScience?.toString())
    const [essay, setEssay] = useState(performance?.essay?.toString())
    const [speech, setSpeech] = useState(performance?.speech?.toString())
    const [interview, setInterview] = useState(performance?.interview?.toString())
    const [objs, setObs] = useState(performance?.objs?.toString())
    const [subs, setSubs] = useState(performance?.subs?.toString())

    const [validationError, setValidationError] = useState<string | null>(null)

    const validateInput = (): string | null => {
        if (overall && !parseFloat(overall)) {
            return "overall must be a number"
        }
        if (math && !parseFloat(math)) {
            return "math must be a number"
        }
        if (music && !parseFloat(music)) {
            return "music must be a number"
        }
        if (econ && !parseFloat(econ)) {
            return "econ must be a number"
        }
        if (science && !parseFloat(science)) {
            return "science must be a number"
        }
        if (lit && !parseFloat(lit)) {
            return "lit must be a number"
        }
        if (art && !parseFloat(art)) {
            return "art must be a number"
        }
        if (socialScience && !parseFloat(socialScience)) {
            return "socialScience must be a number"
        }
        if (essay && !parseFloat(essay)) {
            return "essay must be a number"
        }
        if (speech && !parseFloat(speech)) {
            return "speech must be a number"
        }
        if (interview && !parseFloat(interview)) {
            return "interview must be a number"
        }
        if (objs && !parseFloat(objs)) {
            return "objs must be a number"
        }
        if (subs && !parseFloat(subs)) {
            return "subs must be a number"
        }

        if (!studentId) {
            return "You must select a student!"
        }
        if (teamId == 'null') {
            return "You must select a team!"
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

        if (!studentId) return

        const data: StudentPerformance = {
            id: performance?.id,
            teamId: parseInt(teamId.toString()),
            gpa: gpa,
            studentId: parseInt(studentId?.toString()),
            overall: overall ? parseFloat(overall) : null,
            math: math ? parseFloat(math) : undefined,
            music: music ? parseFloat(music) : undefined,
            econ: econ ? parseFloat(econ) : undefined,
            science: science ? parseFloat(science) : undefined,
            lit: lit ? parseFloat(lit) : undefined,
            art: art ? parseFloat(art) : undefined,
            socialScience: socialScience ? parseFloat(socialScience) : undefined,
            essay: essay ? parseFloat(essay) : undefined,
            speech: speech ? parseFloat(speech) : undefined,
            interview: interview ? parseFloat(interview) : undefined,
            objs: objs ? parseFloat(objs) : undefined,
            subs: subs ? parseFloat(subs) : undefined,
            matchId: matchId
        }

        const result = await api.upsertStudentPerformance(data)
        if (!result.success) {
            alert(result.message)
        } else {
            callback()
        }
    }

    const selectStudent = (student: SearchResultStudent) => {
        setNewStudent(student)
        setStudentId(student.id)
    }

    const unselectStudent = () => {
        setNewStudent(null)
        setStudentId(performance?.studentId)
    }

    const eventSet = new Set(events)

    return (
        <>
            <tr>
                {rank != undefined && <td className="table-cell-small">{rank + 1}</td>}
                <td className='is-link table-cell-large'>
                    <select value={teamId} onChange={e => setTeamId(parseInt(e.target.value))}>
                        <option value="null" hidden disabled>Team...</option>
                        {
                            teams.map(team => (
                                <option key={team.id} value={team.id}>{team.name}</option>
                            ))
                        }
                    </select>
                </td>
                <td className="right-border">{teamNumber}</td>
                <td className="is-link table-cell-large">
                    <PersonSelect currentName={performance?.student?.name || ''} selectedPerson={newStudent} selectPerson={selectStudent} unselectPerson={unselectStudent} />
                </td>
                <td>
                    <select value={gpa} onChange={e => setGpa(e.target.value)}>
                        <option value="H">H</option>
                        <option value="S">S</option>
                        <option value="V">V</option>
                    </select>
                </td>
                <td>
                    <input type="text" size={8} value={overall} onChange={e => setOverall(e.target.value)} />
                </td>
                {math && eventSet.has('math') && <td>
                    <input type="text" size={6} value={math} onChange={e => setMath(e.target.value)} />
                </td>}
                {music && eventSet.has('music') && <td>
                    <input type="text" size={6} value={music} onChange={e => setMusic(e.target.value)} />
                </td>}
                {econ && eventSet.has('econ') && <td>
                    <input type="text" size={6} value={econ} onChange={e => setEcon(e.target.value)} />
                </td>}
                {science && eventSet.has('science') && <td>
                    <input type="text" size={6} value={science} onChange={e => setScience(e.target.value)} />
                </td>}
                {lit && eventSet.has('lit') && <td>
                    <input type="text" size={6} value={lit} onChange={e => setLit(e.target.value)} />
                </td>}
                {art && eventSet.has('art') && <td>
                    <input type="text" size={6} value={art} onChange={e => setArt(e.target.value)} />
                </td>}
                {socialScience && eventSet.has('socialScience') && <td>
                    <input type="text" size={6} value={socialScience} onChange={e => setSocialScience(e.target.value)} />
                </td>}
                {essay && eventSet.has('essay') && <td>
                    <input type="text" size={6} value={essay} onChange={e => setEssay(e.target.value)} />
                </td>}
                {speech && eventSet.has('speech') && <td>
                    <input type="text" size={6} value={speech} onChange={e => setSpeech(e.target.value)} />
                </td>}
                {eventSet.has('interview') && <td>
                    <input type="text" size={6} value={interview} onChange={e => setInterview(e.target.value)} />
                </td>}
                {hasObjs(events) && <td className="table-cell-large">
                    <input type="text" size={8} value={objs} onChange={e => setObs(e.target.value)} />
                </td>}
                {hasSubs(events) && <td className="table-cell-large">
                    <input type="text" size={8} value={subs} onChange={e => setSubs(e.target.value)} />
                </td>}
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