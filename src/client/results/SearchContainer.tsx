import { Route, Routes, Navigate } from 'react-router-dom'
import SearchForm from '@/client/results/SearchForm'
import SearchResult from '@/client/results/SearchResult'
import SchoolResult from '@/client/results/SchoolResult'
import PersonResult from '@/client/results/PersonResult'
import EditsPage from '@/client/admin/EditsPage'
import StatePage from '@/client/results/StatePage'
import SeasonResult from '@/client/results/SeasonResult'
import MatchResult2 from './MatchResult2'
import { NationalsResult } from './NationalsResult'

export default function SearchContainer() {

    return (
        <div className='search-container'>
            <SearchForm />
            <Routes>
                <Route path='edits' element={<EditsPage />} />
                <Route path='' element={<Navigate to="/search" replace />} />
                <Route path='search' element={<SearchResult />} />
                <Route path='school/:id' element={<SchoolResult />} />
                <Route path='school/:id/season/:year' element={<SeasonResult />} />
                <Route path='student/:id' element={<PersonResult />} />
                <Route path='season/:schoolId/:year' element={<SeasonResult />} />
                <Route path='state/:name' element={<StatePage />} />
                <Route path='match/:id' element={<MatchResult2 />} />
                <Route path='nationals' element={<NationalsResult />} />
                <Route element={<h1>Uh-oh! There's no page here!</h1>} />
            </Routes>
        </div>
    )
}