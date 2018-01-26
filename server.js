'use strict';

var express = require('express');
var mongoose = require('mongoose');
var multer = require('multer');
var parse = require('csv-parse/lib/sync');
var bodyParser = require('body-parser');
var School = require('./model/school');
var Match = require('./model/match')

var app = express();
var router = express.Router();

var storage = multer.memoryStorage();
var upload = multer({storage: storage});

var port = process.env.API_PORT || 3001;

var categories = ['math', 'music', 'econ', 'science', 'lit', 'art', 'socialScience', 'essay', 'speech', 'interview'];

mongoose.connect('localhost:27017');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(function(req, res, next) {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
	res.setHeader('Access-Control-Allow-Headers', 'Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers');
	//and remove cacheing so we get the most recent comments
	res.setHeader('Cache-Control', 'no-cache');
	next();
});

router.get('/', function(req, res) {
	res.json({message: 'API initi'});
});

router.route('/search')
	.get(function(req, res) {

		var results = {
			schools: []
		}
		School.find({'name': {'$regex': `^${req.query.query}`, '$options': 'i'}}, function(err, schools) {
			if (err) {
				results.schools = err;
				res.send(results);
				return;
			}
			results.schools = schools;
			res.json(results);
		});
	});

var matchUpload = upload.fields([{name: 'studentData', maxCount: 1}, {name: 'teamData', maxCount: 1}]);
router.route('/matchcreate')
	.post(matchUpload, function(req, res) {

		let studentCols = ['school', 'team', 'gpa', 'decathlete'];
		for (let i = 0; i < categories.length; i++) {
			if (req.body[categories[i]] == 'true') {
				studentCols.push(categories[i]);
			}
		}
		studentCols.push('overall');

		if (req.body.objs == 'true') {
			studentCols.push('objs');
		}
		if (req.body.subs == 'true') {
			studentCols.push('subs');
		}
		let studentData = parse(req.files['studentData'][0].buffer.toString(), {columns: studentCols});

		let teamCols = ['rank', 'school', 'overall', 'objs', 'subs', 'div1', 'div2'];
		let teamData = parse(req.files['teamData'][0].buffer.toString(), {columns: teamCols});

		let data = {
			studentData: studentData,
			teamData: teamData,
			matchData: req.body
		};

		res.json(data);
	});

router.route('/match/:id')
	.get(function(req, res) {
		Match.findOne({'_id': req.params.id}, function(err, match) {
			if (err) {
				res.send(err);
			}
			res.json(match);
		});
	});

router.route('/match')
	.post(function(req, res) {
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
							roundOne: '',
							roundOneId: '',
							regional: '',
							regionalId: '',
							state: '',
							stateId: '',
							national: '',
							nationalId: '',
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
							console.log('saved');
						}
					})
				});
			}
			res.send('success!');
		});

	});

router.route('/school/:id')
	.get(function(req, res) {
		School.findOne({'_id': req.params.id}, function(err, school) {
			if (err) {
				res.send(err);
			}
			res.json(school); 
		});
	})

router.route('/school')
	.post(function(req, res) {
		var school = new School();
		const body = req.body.school;
		school.name = body.name;
		school.city = body.city;
		school.state = body.state;
		school.region = body.region;
		school.district = body.district;
		school.seasons = [];

		school.save(function(err) {
			if (err) res.send(err);
			res.json({message: 'School successfully added!'});
		});
	});

app.use('/api', router);

app.listen(port, function() {
	console.log(`api running on port ${port}`);
});