'use strict';

var express = require('express');
var mongoose = require('mongoose');
const path = require('path');
var multer = require('multer');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var parse = require('csv-parse/lib/sync');
var bodyParser = require('body-parser');
var School = require('./model/school');
var Match = require('./model/match');
var Person = require('./model/person');
var User = require('./model/user');
var Edit = require('./model/edit');

var app = express();
var router = express.Router();

var storage = multer.memoryStorage();
var upload = multer({storage: storage});

var gpaMap = {
	A: 'H',
	B: 'S',
	C: 'V',
	H: 'H',
	S: 'S',
	V: 'V'
}

var roundMap = {
	roundone: 'Round One',
	regionals: 'Regionals',
	state: 'State',
	nationals: 'Nationals'
}

var port = process.env.API_PORT || 3001;

var categories = ['math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview'];

mongoose.connect('localhost:27017');

app.use(bodyParser.urlencoded({extended: true, limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(express.static(path.join(__dirname, "build")));
router.use(function(req, res, next) {
	let token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token) {
		jwt.verify(token, 'deadlydeadlysecret', function(err, decoded) {
			if (decoded) {
				req.auth = true;
				req.access = decoded.access;
				req.canEdit = decoded.canEdit;
				req.username = decoded.username;
			} else {
				req.auth = false;
				req.access = 1;
				req.canEdit = false;
			}
			next();
		});
	} else {
		req.auth = false;
		req.access = 1;
		req.canEdit = false;
		next();
	}
});

function numberWithCommas(x) {
    return x.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function removeBreakdownsFromMatch(match) {
	let students = match.students;
	let newStudents = [];
	for (let i = 0; i < students.length; i++) {
		let student = students[i];
		let newStudent = {};
		['id', 'school', 'team', 'gpa', 'decathlete', 'overall'].forEach(key => {
			newStudent[key] = student[key];
		});
		newStudents.push(newStudent);
	}
	match.students = newStudents;
	return match;
}

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, x-access-token');
	//and remove cacheing so we get the most recent comments
	res.setHeader('Cache-Control', 'no-cache');
	next();
});

router.get('/', function(req, res) {
	res.json({message: 'API initi'});
});

router.route('/authenticate')
	.get(function(req, res) {
		if (req.auth) {
			res.json({
				success: true
			})
		} else {
			res.json({
				success: false
			})
		}
	});

router.route('/user')
	.post(function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let access = req.body.access;
		let canEdit = req.body.canEdit === 'true';

		bcrypt.hash(password, 10, function(err, hash) {
			let user = new User();
			user.username = username;
			user.passhash = hash;
			user.access = access;
			user.canEdit = canEdit;
			User.findOne({username: username}, function(err, result) {
				if (result) {
					res.json({success: false, message: 'Already a user with that username!'});
					return;
				}
				user.save(function(err) {
					if (err) {
						res.send(err);
						return;
					}
					res.json({success: true, message: 'User successfully added!'});
				});
			});
		});
	});

router.route('/login')
	.post(function(req, res) {
		User.findOne({username: req.body.username}, function(err, user) {
			if (!user) {
				res.json({success: false, message: "No user with that username!"});
				return;
			}
			bcrypt.compare(req.body.password, user.passhash, function(err, result) {
				if (!result) {
					res.json({success: false, message: "Incorrect password!"});
					return;
				} else {
					const payload = {
						access: user.access,
						canEdit: user.canEdit,
						username: user.username
					};
					let token = jwt.sign(payload, 'deadlydeadlysecret', {
						expiresIn: '30d'
					});
					res.json({success: true, token, expiresIn: 30*24*60*60*1000, canEdit: user.canEdit, access: user.access, username: user.username});
				}
			});
		});
	});

router.route('/search')
	.get(function(req, res) {

		let results = {
			schools: [],
			people: [],
		}

		if (!req.query.query || req.query.query.length < 3) {
			res.json(results);
			return;
		}

		let schoolsQuery, peopleQuery, matchQuery;
		if (req.query.limit) {
			let limit = parseInt(req.query.limit);
			schoolsQuery = School.find({
				$or: [
					{'name': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'fullName': {'$regex': `^${req.query.query}`, '$options': 'i'}}
				]
			}).limit(limit);
			peopleQuery = Person.find({'name': {'$regex': `^${req.query.query}`, '$options': 'i'}}).limit(limit);
			matchQuery = Match.find({
				$or: [
					{'search1': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'search2': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'search3': {'$regex': `^${req.query.query}`, '$options': 'i'}},
				]
			}).limit(limit);
		} else {
			schoolsQuery = School.find({
				$or: [
					{'name': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'fullName': {'$regex': `^${req.query.query}`, '$options': 'i'}}
				]
			});
			peopleQuery = Person.find({'name': {'$regex': `^${req.query.query}`, '$options': 'i'}});
			matchQuery = Match.find({
				$or: [
					{'search1': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'search2': {'$regex': `^${req.query.query}`, '$options': 'i'}},
					{'search3': {'$regex': `^${req.query.query}`, '$options': 'i'}},
				]
			});
		}

		schoolsQuery.exec(function(err, schools) {
			if (err) {
				results.schools = err;
				res.send(results);
				return;
			}
			results.schools = schools;
			peopleQuery.exec(function(err, people) {
				if (err) {
					results.people = err;
					res.send(results);
					return;
				}
				results.people = people;
				matchQuery.exec(function(err, matches) {
					if (err) {
						results.people = err;
						res.send(results);
						return;
					}
					results.matches = matches.map(match => {
						return {
							_id: match._id,
							year: match.year,
							round: match.round,
							state: match.state,
							region: match.region
						}
					});
					res.json(results);
				});
			});
		});
	});

var matchUpload = upload.fields([{name: 'studentData', maxCount: 1}, {name: 'teamData', maxCount: 1}, {name: 'overallData', maxCount: 1}]);
router.route('/matchcreate')
	.post(matchUpload, function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		let studentCols = ['school', 'team', 'gpa', 'decathlete'];
		for (let i = 0; i < categories.length; i++) {
			if (req.body[categories[i]] == 'true') {
				studentCols.push(categories[i]);
			}
		}
		let studentData = parse(req.files['studentData'][0].buffer.toString(), {columns: studentCols});
		let studentMapping = {};
		studentData.forEach(row => {
			studentMapping[`${row.decathlete}...${row.school}`] = true;
		});
		let teamCols = ['rank', 'school', 'overall'];
		if (!(req.body.incompleteData === 'true')) {
			teamCols.push('objs');
			teamCols.push('subs');
		}
		if (req.body.hasDivisions === 'true') {
			teamCols.push('division');
		}
		let teamData = parse(req.files['teamData'][0].buffer.toString(), {columns: teamCols});

		let overallData = [], overallMapping = {};
		if (req.body.incompleteData === 'true') {
			let overallCols = ['gpa', 'decathlete', 'school', 'overall'];
			overallData = parse(req.files['overallData'][0].buffer.toString(), {columns: overallCols});
			overallData.forEach(row => {
				overallMapping[`${row.decathlete}...${row.school}`] = row.overall;
			});
		}
		studentData.forEach(student => {
			let overall = 0, objs = 0, subs = 0;
			categories.forEach(category => {
				if (req.body[category] === 'true') {
					overall += parseFloat(student[category]);
					if (category === 'essay' || category === 'interview' || category === 'speech') {
						subs += parseFloat(student[category]);
					} else {
						objs += parseFloat(student[category]);
					}
					student[category] = Math.round(parseFloat(student[category]) * 10) / 10;
				}
			});
			if (!(req.body.incompleteData === 'true')) {
				student.overall = Math.round(overall * 10) / 10;
			} else {
				student.overall = overallMapping[`${student.decathlete}...${student.school}`];
			}
			student.objs = Math.round(objs * 10) /10;
			student.subs = Math.round(subs * 10) / 10;
			student.gpa = gpaMap[student.gpa] || student.gpa;
		});

		overallData.forEach(row => {
			if (!studentMapping[`${row.decathlete}...${row.school}`]) {
				studentData.push({
					decathlete: row.decathlete,
					school: row.school,
					overall: row.overall,
					gpa: row.gpa
				});
			}
		});

		let dbCalls = [];
		teamData.forEach(team => {
			['overall', 'objs', 'subs'].forEach(category => {
				team[category] = numberWithCommas(parseFloat(team[category]));
			});
			dbCalls.push(School.findOne({$or: [
					{'name': {'$regex': `^${team.school}`, '$options': 'i'}},
					{'fullName': {'$regex': `^${team.school}`, '$options': 'i'}}
				]}));
		});

		Promise.all(dbCalls).then(result => {
			for (let i = 0; i < teamData.length; i++) {
				teamData[i].suggestion = result[i];
			}

			let data = {
				studentData: studentData,
				teamData: teamData,
				matchData: req.body
			};

			res.json(data);
		});
	});

router.route('/match/:id')
	.get(function(req, res) {
		Match.findOne({'_id': req.params.id}, function(err, match) {
			if (err) {
				res.send(err);
				return;
			}
			if (req.access < match.access) {
				match = removeBreakdownsFromMatch(match);
			}
			res.json(match);
		});
	})
	.delete(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		Match.findOne({'_id': req.params.id}, function(err, match) {
			if (err) {
				res.send(err);
				return;
			}
			match.students.forEach(student => {
				Person.findOne({'_id': student.id}, function(err, person) {
					let seasons = person.seasons;
					for (let i = 0; i < seasons.length; i++) {
						if (seasons[i].year === match.year) {
							seasons[i][match.round] = '';
							seasons[i][`${match.round}Id`] = '';
							seasons[i][`${match.round}GPA`] = '';
						}
					}
					Person.findOneAndUpdate({'_id': person._id}, {seasons}, function(err, doc) {
						if (err) {
							console.log(err);
						}
					});
				});
			});
			match.teams.forEach(team => {
				School.findOne({'_id': team.id}, function(err, school) {
					let seasons = school.seasons;
					for (let i = 0; i < seasons.length; i++) { 
						if (seasons[i].year === match.year) {
							seasons[i][match.round] = '';
							seasons[i][`${match.round}Id`] = '';
						}
					}
					School.findOneAndUpdate({'_id': school._id}, {seasons}, function(err, doc) {
						if (err) {
							console.log(err);
						}
					});
				});
			});
			Match.findOneAndRemove({'_id': req.params.id}, function(err, match) {
				let edit = new Edit();
				edit.user = req.username;
				edit.datetime = new Date();
				edit.summary = `CREATE MATCH: ${match.year} ${match.round}`;
				edit.summary += ((match.round !== 'nationals') ? ' ' + match.state : '')
				edit.summary += ((match.round !== 'nationals' && match.round !== 'state') ? ' ' + match.region : '');
				edit.save(function(err) {
					res.json({
						success: true
					});
				});
			});
		});
	});

router.route('/match/:round/:state/:param1/:param2?')
	.get(function(req, res) {
		let region, year;
		if (req.params.param2) {
			region = req.params.param1;
			year = req.params.param2;
		} else {
			region = undefined;
			year = req.params.param1;
		}
		const state = req.params.state.replace('_', ' ');
		const round = req.params.round.toLowerCase();
		let searchTerm = {'year': year, 'round': round, 'state': state};
		if (round === 'roundone' || round === 'regionals') {
			if (!region) {
				res.json(null);
				return;
			} 
			searchTerm.region = region.replace('_', ' ');
		}
		Match.findOne(searchTerm, function(err, match) {
			if (err) {
				res.send(err);
				return;
			}
			if (req.access < match.access) {
				match = removeBreakdownsFromMatch(match);
			}
			res.json(match);
		});
	});

router.route('/match')
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		let studentData = req.body.studentData;
		let teamData = req.body.teamData;
		let matchData = req.body.matchData;

		let match = new Match();
		match.year = matchData.year;
		match.round = matchData.round;
		match.region = matchData.region;
		match.state = matchData.state;
		match.date = matchData.date;
		match.site = matchData.site;
		match.hasDivisions = matchData.hasDivisions === 'true';
		match.access = matchData.access;
		match.incompleteData = matchData.incompleteData === 'true';
		match.search1 = `${match.year} ${match.round !== 'nationals' ? match.state + ' ' : ''}${match.round !== 'nationals' && match.round !== 'state' ? match.region + ' ' : ''}${roundMap[match.round]}`;
		match.search2 = `${match.year} ${roundMap[match.round]} ${match.round !== 'nationals' ? match.state + ' ' : ''}${match.round !== 'nationals' && match.round !== 'state' ? match.region + ' ' : ''}`;
		match.search3 = `${match.round !== 'nationals' ? match.state + ' ' : ''}${match.round !== 'nationals' && match.round !== 'state' ? match.region + ' ' : ''}${roundMap[match.round]} ${match.year}`;

		let events = {};
		events.math = (matchData.math == 'true');
		events.music = (matchData.music == 'true');
		events.econ = (matchData.econ == 'true');
		events.science = (matchData.science == 'true');
		events.lit = (matchData.lit == 'true');
		events.art = (matchData.art == 'true');
		events.socialScience = (matchData.socialScience == 'true');
		events.essay = (matchData.essay == 'true');
		events.speech = (matchData.speech == 'true');
		events.interview = (matchData.interview == 'true');
		events.objs = (matchData.objs == 'true');
		events.subs = (matchData.subs == 'true');

		match.events = events;
		match.students = studentData;
		match.teams = teamData;

		let newSchools = [];
		let newIndices = [];

		match.teams.forEach((team, i) => {
			if (!team.id) {
				let school = {};
				school.name = team.school;
				school.city = '';
				school.state = (match.round !== 'nationals') ? match.state : '';
				school.region = (match.round !== 'state' && match.round !== 'nationals') ? match.region : '';
				school.district = '';
				school.seasons = [{
					year: match.year, 
					roundone: '',
					roundoneId: '',
					regionals: '',
					regionalsId: '',
					state: '',
					stateId: '',
					nationals: '',
					nationalsId: ''
				}];

				newSchools.push(school);
				newIndices.push(i);
			}
		});

		School.create(newSchools, function(err, schools) {
			newIndices.forEach((index, i) => {
				match.teams[index].id = schools[i].id;
			});

			let schoolToId = {};
			match.teams.forEach(team => {
				schoolToId[team.school] = team.id;
			});

			let studentCalls = [];
			match.students.forEach(student => {
				studentCalls.push(Person.findOne({'name': student.decathlete, 'schoolId': schoolToId[student.school]}));
			});
			
			Promise.all(studentCalls).then(result => {
				for (let i = 0; i < match.students.length; i++) {
					if (result[i]) {
						match.students[i].id = result[i]._id;
					}
				}

				let newPeople = [];
				let studentIndices = [];

				match.students.forEach((student, i) => {
					if (!student.id) {
						let person = {};
						person.name = student.decathlete;
						person.school = student.school;
						person.schoolId = schoolToId[student.school];
						person.seasons = [{
							year: match.year, 
							roundone: '',
							roundoneId: '',
							roundoneGPA: '',
							regionals: '',
							regionalsId: '',
							roundoneGPA: '',
							state: '',
							stateId: '',
							stateGPA: '',
							nationals: '',
							nationalsId: '',
							nationalsGPA: ''
						}];

						newPeople.push(person);
						studentIndices.push(i);
					}
				});

				let schoolFinding = newPeople.map(person => {
					return School.findOne({'_id': person.schoolId});
				});
				Promise.all(schoolFinding).then(result => {
					for (let i = 0; i < newPeople.length; i++) {
						console.log(result[i]);
						newPeople[i].city = result[i].city;
						newPeople[i].state = result[i].state;
						newPeople[i].fullSchool = result[i].fullName;
					}
					Person.create(newPeople, function(err, people) {
					studentIndices.forEach((index, i) => {
						match.students[index].id = people[i].id;
					});
					match.save(function(err, match) {
						let id = match.id;
						for (let i = 0; i < match.teams.length; i++) {
							School.findOne({'_id': match.teams[i].id}, function(err, school) {
								let seasons = school.seasons;
								let yearExists = false;
								for (let j = 0; j < seasons.length; j++) {
									if (seasons[j].year === match.year) {
										seasons[j][match.round] = match.teams[i].overall;
										seasons[j][`${match.round}Id`] = id;
										yearExists = true;
									}
								}
								if (!yearExists) {
									let newSeason = {
										year: match.year,
										roundone: '',
										roundoneId: '',
										regionals: '',
										regionalsId: '',
										state: '',
										stateId: '',
										nationals: '',
										nationalsId: '',
									};

									newSeason[match.round] = match.teams[i].overall;
									newSeason[`${match.round}Id`] = id;
									seasons.push(newSeason);

								}
								school.seasons = seasons;
								school.save(function(err) {
									if (err) {
										console.log('err');
									} else {
									}
								})
							});
						}
						for (let i = 0; i < match.students.length; i++) {
							Person.findOne({'_id': match.students[i].id}, function(err, person) {
								let seasons = person.seasons;
								let yearExists = false;
								for (let j = 0; j < seasons.length; j++) {
									if (seasons[j].year === match.year) {
										seasons[j][match.round] = match.students[i].overall;
										seasons[j][`${match.round}Id`] = id;
										seasons[j][`${match.round}GPA`] = match.students[i].gpa;
										yearExists = true;
									}
								}
								if (!yearExists) {
									let newSeason = {
										year: match.year,
										roundone: '',
										roundoneId: '',
										roundoneGPA: '',
										regionals: '',
										regionalsId: '',
										regionalsGPA: '',
										state: '',
										stateId: '',
										stateGPA: '',
										nationals: '',
										nationalsId: '',
										nationalsGPA: ''
									};

									newSeason[match.round] = match.students[i].overall;
									newSeason[`${match.round}Id`] = id;
									newSeason[`${match.round}GPA`] = match.students[i].gpa;
									seasons.push(newSeason);
								}
								person.seasons = seasons;
								person.save(function(err) {
									if (err) {
										console.log('err');
									} else {
									}
								})
							});
						}
						let edit = new Edit();
						edit.user = req.username;
						edit.datetime = new Date();
						edit.summary = `CREATE MATCH: ${match.year} ${match.round}`;
						edit.summary += ((match.round !== 'nationals') ? ' ' + match.state : '')
						edit.summary += ((match.round !== 'nationals' && match.round !== 'state') ? ' ' + match.region : '');
						console.log('whaat');
						console.log(edit.summary);
						edit.save(function(err) {
							res.json({
								success: true,
								matchId: match._id
							});
						});
					});
				});
			});
		});
	});

});

router.route('/matchstudent/:id')
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		Match.findOne({'_id': req.params.id}, function(err, match) {
			let students = match.students;
			let year = match.year;
			let round = match.round;
			let index = req.body.index;
			let id = req.body.edits.id;
			if (id !== students[index].id) {
				Person.findOne({'_id': students[index].id}, function(err, person) {
					if (person) {
						let seasons = person.seasons;
						seasons.forEach(season => {
							if (season.year === year) {
								season[round] = '';
								season[`${round}Id`] = '';
								season[`${round}GPA`] = '';
							}
						});
						Person.findOneAndUpdate({'_id': students[index].id}, {seasons}, function(err, result) {
							if (err) {
								console.log(err);
							}
						});
					}
				});
			}
			delete req.body.edits.selectedPerson;
			students[index] = req.body.edits;
			Match.findOneAndUpdate({'_id': req.params.id}, {students}, function(err, doc) {
				if (err) {
					res.send(500, {error: err});
					return;
				}
				Person.findOne({'_id': id}, function(err, person) {
					let seasons = person.seasons;
					seasons.forEach(season => {
						if (season.year === year) {
							season[round] = req.body.edits.overall;
							season[`${round}GPA`] = req.body.edits.gpa;
							season[`${round}Id`] = req.params.id;
						}
					});
					Person.findOneAndUpdate({'_id': id}, {seasons: seasons}, function(err, documents) {
						if (err) {
							res.send(500, {error: err});
							return;
						}
						res.json({
							success: true
						});
					});
				});
			});
		});
	});

router.route('/matchteam/:id')
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		Match.findOne({'_id': req.params.id}, function(err, match) {
			let teams = match.teams;
			let year = match.year;
			let round = match.round;
			let index = req.body.index;
			teams[index].id = req.body.edits.id;
			teams[index].overall = req.body.edits.overall;
			teams[index].objs = req.body.edits.objs;
			teams[index].subs = req.body.edits.subs;
			School.findOne({'_id': req.body.edits.id}, function(err, school) {
				let students = [...match.students];
				for (let i = 0; i < students.length; i++) {
					if (students[i].school === teams[index].school) {
						console.log(students[i].decathlete);
						students[i].school = school.name;
					}
				}
				teams[index].school = school.name;
				Match.findOneAndUpdate({'_id': req.params.id}, {teams, students}, function(err, doc) {
					if (err) {
						res.send(500, {error: err});
						return;
					}
					let seasons = school.seasons;
					seasons.forEach(season => {
						if (season.year === year) {
							season[round] = req.body.edits.overall
						}
					});
					School.findOneAndUpdate({'_id': req.body.edits.id}, {seasons: seasons}, function(err, documents) {
						if (err) {
							res.send(500, {error: err});
							return;
						}
						res.json({
							success: true
						});
					});
				});
			});
		});
	});

router.route('/school/:id')
	.get(function(req, res) {
		School.findOne({'_id': req.params.id}, function(err, school) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(school); 
		});
	})
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		School.findOneAndUpdate({'_id': req.params.id}, req.body.edits, function(err, doc) {
			if (err) {
				res.send(500, {error: err});
				return;
			}
			Person.find({'schoolId': req.params.id}, function(err, people) {
				people.forEach(person => {
					person.city = req.body.edits.city,
					person.state = req.body.edits.state,
					person.fullSchool = req.body.edits.fullName
					Person.findOneAndUpdate({'_id': person._id}, person, function(err, doc) {
						if (err) console.log(err);
					});
				});
				let edit = new Edit();
				edit.user = req.username;
				edit.datetime = new Date();
				edit.summary = `EDIT SCHOOL: ${req.body.edits.name} (${req.body.edits.state})`
				edit.save(function(err) {
					res.json({
						success: true
					});
				});
			});
		});
	});

router.route('/mergepeople/:godId/:peonId')
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		Person.findOne({'_id': req.params.godId}, function(err, god) {
			if (err) {
				res.send(500, {error: err});
				return;
			}
			Person.findOne({'_id': req.params.peonId}, function(err, peon) {
				if (err) {
					res.send(500, {error: err});
					return;
				}
				let godSeasons = god.seasons;
				let peonSeasons = peon.seasons;
				for (let j = 0; j < peonSeasons.length; j++) {
					let matchedSeason = false;
					for (let i = 0; i < godSeasons.length; i++) {
						if (godSeasons[i].year === peonSeasons[j].year) {
							matchedSeason = true;
							['roundone', 'regionals', 'state', 'nationals'].forEach(round => {
								if (!godSeasons[i][round]) {
									godSeasons[i][round] = peonSeasons[j][round];
									godSeasons[i][`${round}Id`] = peonSeasons[j][`${round}Id`];
									godSeasons[i][`${round}GPA`] = peonSeasons[j][`${round}GPA`];
								}
							});
						}
					}
					if (!matchedSeason) {
						let newSeason = {year: peonSeasons[j].year};
						['roundone', 'regionals', 'state', 'nationals'].forEach(round => {
							if (!newSeason[round]) {
								newSeason[round] = peonSeasons[j][round];
								newSeason[`${round}Id`] = peonSeasons[j][`${round}Id`];
								newSeason[`${round}GPA`] = peonSeasons[j][`${round}GPA`];
							}
						});
						godSeasons.push(newSeason);
					}
				}
				Person.findOneAndUpdate({'_id': req.params.godId}, {seasons: godSeasons}, function(err, update) {
					if (err) {
						res.send(500, {error: err});
						return;
					}
					Person.findOneAndRemove({'_id': req.params.peonId}, function(err, result) {
						if (err) {
							res.send(500, {error: err});
							return;
						}
						let edit = new Edit();
						edit.user = req.username;
						edit.datetime = new Date();
						edit.summary = `MERGE PEOPLE: ${god.name} ${peon.name}`
						edit.save(function(err) {
							res.json({
								success: true
							});
						});
					});
				});
			});
		});
	});

router.route('/person/:id')
	.get(function(req, res) {
		Person.findOne({'_id': req.params.id}, function(err, person) {
			if (err) {
				res.send(err);
				return;
			}
			res.json(person); 
		});
	})
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		School.findOne({'_id': req.body.edits.schoolId}, function(err, school) {
			if (err) {
				res.send(err);
				return;
			}
			let edits = {
				name: req.body.edits.name,
				schoolId: req.body.edits.schoolId,
				school: school.name,
				fullSchool: school.fullName,
				city: school.city,
				state: school.state
			}
			Person.findOneAndUpdate({'_id': req.params.id}, edits, function(err, doc) {
				if (err) {
					res.send(500, {error: err});
					return;
				}
				let edit = new Edit();
				edit.user = req.username;
				edit.datetime = new Date();
				edit.summary = `EDIT PERSON: ${edits.name} (${school.state})`
				edit.save(function(err) {
					res.json({
						success: true
					});
				});
			});
		});
	});

router.route('/school')
	.post(function(req, res) {
		if (!req.auth || !req.canEdit) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		var school = new School();
		const body = req.body.school;
		school.name = body.name;
		school.fullName = body.fullName;
		school.city = body.city;
		school.state = body.state;
		school.region = body.region;
		school.district = body.district;
		school.seasons = [];

		school.save(function(err) {
			if (err) {
				res.send(err);
				return;
			}
			let edit = new Edit();
			edit.user = req.username;
			edit.datetime = new Date();
			edit.summary = `CREATE SCHOOL: ${school.name} (${school.state})`
			edit.save(function(err) {
				res.json({message: 'School successfully added!'});
			});
		});
	});

router.route('/edits')
	.post(function(req, res) {
		if (!req.auth || req.access !== 4) {
			res.json({
				success: false,
				message: 'Not authorized'
			});
			return;
		}
		let lastDate = req.body.date;
		let searchTerm = {};
		if (lastDate) {
			searchTerm = {datetime: {$lt: new Date(lastDate)}}
		}
		Edit.find(searchTerm).sort({datetime: -1}).limit(10).exec(function(err, results) {
			if (err) {
				res.json({
					success: false,
					err
				});
			}
			res.json({
				success: true,
				edits: results
			});
		});
	});

app.use('/api', router);
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });

app.listen(port, function() {
	console.log(`api running on port ${port}`);
});