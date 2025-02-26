
let EditingGuide = () => {
    return (
        <div className='info-page' style={{ maxWidth: 620, marginBottom: 20 }}>
            <div className='info-page-header'>
                <div className='info-title'>AD-DB Editing Guide</div>
                <p>So you want to edit the database...</p>
            </div>
            <div className='info-page-section'>Creating a Match</div>
            <p>It all begins here.</p>
            <h4>1. Prerequisites</h4>
            <p>First, prepare your data. For most matches, you'll need two .csv files; for some, you'll need three. The first file contains student breakdown data. Each row is formatted as follows:</p>
            <p className='centered'><b>School | Team Number | GPA | Student Name | Categories...</b></p>
            <p>Categories should be in the following order:</p>
            <p className='centered'><b>Math | Music | Econ | Sci | Lit | Art | SS | Essay | Speech | Interview</b></p>
            <p>If a match did not feature a category, <i>do not leave a blank column</i>. Just ignore that event. There should not be any blank spaces
                in the file! If a student's name is missing, just add a placeholder like "anon", "-", or "drop". If a score is missing, replace it with 0.</p>
            <p>GPAs should be one of the letters A, B, C, H, S, V. It will automatically be converted to H/S/V format.</p>
            <p>Now, create a .csv file for the overall team data. The rows should be in order of team rank. It should have the following format:</p>
            <p className='centered'><b>Rank | Team Name | Overall Score | Objs Score | Subs Score | Division?</b></p>
            <p>The division column is only necessary if your match actually has divisions. The following options are currently available:</p>
            <div className='centered'>L: Large Schools</div>
            <div className='centered'>M: Medium Schools</div>
            <div className='centered'>S: Small Schools</div>
            <div className='centered'>XS: Extra Small Schools</div>
            <div className='centered'>N: Novice Schools</div>
            <div className='centered'>1: Division I</div>
            <div className='centered'>2: Division II</div>
            <div className='centered'>3: Division III</div>
            <div className='centered'>4: Division IV</div>
            <div className='centered'>Red: Red Division</div>
            <div className='centered'>Blue: Blue Division</div>
            <div className='centered'>White: White Division</div>
            <div className='centered'>Nittany: Nittany</div>
            <div className='centered'>Susquehanna: Susquehanna</div>
            <p>Therefore the column should have a value in [L, M, S, XS, N, 1, 2, 3, 4, Red, White, Blue, Nittany, Susquehanna].</p>
            <p>Now that you've created your .csv files, please double check that they have no blank entries, and use a text editor to check that there are no extra empty rows or columns, because Excel be like that sometimes.</p>
            <p>Finally, check that the match does not contain any schools with ambiguous names. For example, Texas has schools named Liberty and Frisco Liberty, but they may both show up as Liberty in match data.</p>
            <p>If there are schools with confusing names and they don't yet exist in the DB, you should create the school so you can link to it later.</p>
            <h4>2. Match Info</h4>
            <p>Hooray, the data is all ready! Now you can follow the New Match link at the bottom of the page. This page is pretty
                self explanatory. Enter the year, round, region and state if applicable. </p>
            <p>Please try to enter an accurate date for the match, since the site uses this for
                sorting matches and showing the freshest ones first. The date can be in most reasonable formats e.g. MM/DD/YYYY, Month DD, Year, etc. If you do not know the date, at least put the month and year if possible.</p>
            <p>Site is the arena/battleground where the match took place, and is optional.</p>
            <p>Uncheck any categories that the event didn't feature.</p>
            <p>Select "Divisions" in the Divisions menu if you included a divisions column in your team data. Pick an access level.</p>
            <p>The "does this competition have incomplete student data?" box should usually not be checked. If you do not have student breakdowns for every team, contact patrickjwahl@gmail.com for info on how
                to upload a match with incomplete breakdowns.</p>
            <p>Finally, select your student and team data .csv files. Make sure the data looks good and click Continue.</p>
            <h4>3. School Linking</h4>
            <p>At the next page, you should see a list of the schools in your match. If you don't, your team data was probably formatted incorrectly, so don't click the Create Match button!</p>
            <p>This page is for linking the schools in your new match to already existing schools, so that their scores will be updated. The DB will try to automatically choose the correct school,
                but since a lot of schools have the same name it may not always pick the right one!</p>
            <p>The name of the school from the new match data is shown above the search box, and the selected school from the DB is displayed below. Type in the box to search for a school, and click one to select it.</p>
            <p>If no school is selected, a new one will be created. You can click the 'x' button next to a selected school to remove that school.</p>
            <p>Once you are certain that every school is either linked properly or doesn't exist yet, click the Create Match button. Congratulations, you're done!</p>

            <div className='info-page-section'>Merging People</div>
            <p>...well, not quite.</p>
            <p>When you create a match, the DB will try to match each person with someone with the same name and school. If it finds a match, it will update that person's data. If it doesn't, it creates a new student.</p>
            <p>Sometimes, match data will spell students' names differently between matches, or a student could switch schools (or teams within a school), causing the DB to have two pages for the same student. When this problem arises, the PeopleMerger-9000 can come in handy.</p>
            <p>You have to select two people to merge in the same way you'd do when linking schools.</p>
            <p>The new person will merge the match data from the "God" and the "Peon", with the God's data overwriting the Peon's if necessary. The God's school will also be kept.</p>
        </div>
    )
}

export default EditingGuide