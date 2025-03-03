import { StateMatches } from '@/shared/types/response'
import { ftoa, groupBy } from '@/shared/util/functions'
import { useState } from 'react'
import { Link } from 'react-router-dom'

type MatchesByRoundType = {
    roundone?: StateMatches,
    regionals?: StateMatches,
    state?: StateMatches
}

export default function StatePageYearDisplay({ year, data }: {
    year: number,
    data: StateMatches
}) {

    const [open, setOpen] = useState(false)

    if (!data) return (null)

    const matchesByRound: MatchesByRoundType = groupBy(data, match => match.round)

    const canOpen = matchesByRound.regionals && matchesByRound.regionals.length > 1 || matchesByRound.roundone && matchesByRound.roundone.length > 1

    const toggleOpen = () => {
        if (canOpen) {
            setOpen(!open)
        }
    }

    let content
    if (matchesByRound.state) {
        const m = matchesByRound.state[0]
        content = (
            <>
                <div className='search-result-subtitle'>1. {m.first} - {ftoa(m.firstScore)}</div>
                <div className='search-result-subtitle'>2. {m.second} - {ftoa(m.secondScore)}</div>
                <div className='search-result-subtitle'>3. {m.third} - {ftoa(m.thirdScore)}</div>
            </>
        )
    } else {
        content = [(
            <div>
                <br />
                <div className='search-result-subtitle'>No data!</div>
                <br />
            </div>
        )]
    }

    let link
    if (matchesByRound.state) {
        link = (
            <Link to={`/match/${matchesByRound.state[0].id}`}>
                <div className='state-page-link'>
                    <div className='search-result-title'>State</div>
                    {content}
                </div>
            </Link>
        )
    } else {
        link = (
            <div className='state-page-link state-page-link-disabled'>
                <div className='search-result-title'>State</div>
                {content}
            </div>
        )
    }
    let stateBox = (
        <div className='state-page-stack'>
            {link}
        </div>
    )

    let regionalsBox, roundoneBox
    if (open && matchesByRound.regionals) {
        regionalsBox = (
            <div className='state-page-stack'>
                {matchesByRound.regionals.map(match => {
                    return (
                        <Link key={match.id} to={`/match/${match.id}`} className='state-page-stack-link' >
                            <div className='state-page-link'>
                                <div className='search-result-title'>{match.region}</div>
                                <div className='search-result-subtitle'>1. {match.first} - {ftoa(match.firstScore)}</div>
                                <div className='search-result-subtitle'>2. {match.second} - {ftoa(match.secondScore)}</div>
                                <div className='search-result-subtitle'>3. {match.third} - {ftoa(match.thirdScore)}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    } else {
        let allScores: { name: string, score: number }[] = []
        matchesByRound.regionals && matchesByRound.regionals.forEach(match => {
            allScores.push({ name: match.first, score: match.firstScore }, { name: match.second, score: match.secondScore }, { name: match.third, score: match.thirdScore })
        })
        allScores = allScores.sort((a, b) => b.score - a.score).slice(0, 3)

        let content = allScores.map((entry, index) => (
            <div key={index} className='search-result-subtitle'>{index + 1}. {entry.name} - {ftoa(entry.score)}</div>
        ))
        let disableLink = content.length === 0
        if (content.length === 0) {
            content.push(
                <div>
                    <br />
                    <div className='search-result-subtitle'>No data!</div>
                    <br />
                </div>
            )
        }
        let link
        if (disableLink) {
            link = (
                <div className='state-page-link state-page-link-disabled'>
                    <div className='search-result-title'>Regionals</div>
                    {content}
                </div>
            )
        } else if (matchesByRound.regionals?.length == 1) {
            link = (
                <Link to={`/match/${matchesByRound.regionals[0].id}`} >
                    <div className='state-page-link'>
                        <div className='search-result-title'>Regionals</div>
                        {content}
                    </div>
                </Link>
            )
        } else {
            link = (
                <div className='state-page-link state-page-fake-link'>
                    <div className='search-result-title'>Regionals</div>
                    {content}
                </div>
            )
        }
        regionalsBox = (
            <div className='state-page-stack'>
                {link}
            </div>
        )
    }
    if (open && matchesByRound.roundone) {
        roundoneBox = (
            <div className='state-page-stack'>
                {matchesByRound.roundone.map(match => {
                    return (
                        <Link key={match.id} to={`/match/${match.id}`} className='state-page-stack-link' >
                            <div className='state-page-link'>
                                <div className='search-result-title'>{match.region}</div>
                                <div className='search-result-subtitle'>1. {match.first} - {ftoa(match.firstScore)}</div>
                                <div className='search-result-subtitle'>2. {match.second} - {ftoa(match.secondScore)}</div>
                                <div className='search-result-subtitle'>3. {match.third} - {ftoa(match.thirdScore)}</div>
                            </div>
                        </Link>
                    )
                })}
            </div>
        )
    } else {
        let allScores: { name: string, score: number }[] = []
        matchesByRound.roundone && matchesByRound.roundone.forEach(match => {
            allScores.push({ name: match.first, score: match.firstScore }, { name: match.second, score: match.secondScore }, { name: match.third, score: match.thirdScore })
        })
        allScores = allScores.sort((a, b) => b.score - a.score).slice(0, 3)

        let content = allScores.map((entry, index) => (
            <div key={index} className='search-result-subtitle'>{index + 1}. {entry.name} - {ftoa(entry.score)}</div>
        ))
        let disableLink = content.length === 0
        if (content.length === 0) {
            content.push(
                <div>
                    <br />
                    <div className='search-result-subtitle'>No data!</div>
                    <br />
                </div>
            )
        }
        let r1link
        if (disableLink) {
            r1link = (
                <div className='state-page-link state-page-link-disabled'>
                    <div className='search-result-title'>Round One</div>
                    {content}
                </div>
            )
        } else if (matchesByRound.roundone) {
            r1link = (
                <Link to={`/match/${matchesByRound.roundone[0].id}`} >
                    <div className='state-page-link'>
                        <div className='search-result-title'>Round One</div>
                        {content}
                    </div>
                </Link>
            )
        } else {
            r1link = (
                <div className='state-page-link state-page-fake-link'>
                    <div className='search-result-title'>Round One</div>
                    {content}
                </div>
            )
        }
        roundoneBox = (
            <div className='state-page-stack'>
                {r1link}
            </div>
        )
    }
    return (
        <div className={'state-page-year-bar' + (open ? ' state-page-year-bar-open' : '')} onClick={toggleOpen}>
            <div className='state-page-year-bar-year'>
                <span>{year}</span>
            </div>
            {stateBox}
            <div style={{ borderLeft: "1px solid #777" }} hidden={!open}></div>
            {regionalsBox}
            <div style={{ borderLeft: "1px solid #777" }} hidden={!open}></div>
            {roundoneBox}
        </div>
    )
}