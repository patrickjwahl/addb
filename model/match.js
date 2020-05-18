'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MatchSchema = new Schema({
	search1: String,
	search2: String,
	search3: String,
	year: String,
	round: String,
	region: String,
	state: String,
	date: Date,
	site: String,
	incompleteData: Boolean,
	hasDivisions: Boolean,
	access: Number,
	events: {
		math: Boolean,
		music: Boolean,
		econ: Boolean,
		science: Boolean,
		lit: Boolean,
		art: Boolean,
		socialScience: Boolean,
		essay: Boolean,
		speech: Boolean,
		interview: Boolean,
		objs: Boolean,
		subs: Boolean
	},
	students: [
		{
			id: String,
			school: String,
			teamName: String,
			team: String,
			gpa: String,
			decathlete: String,
			math: String,
			music: String,
			econ: String,
			science: String,
			lit: String,
			art: String,
			socialScience: String,
			essay: String,
			speech: String,
			interview: String,
			overall: String,
			objs: String,
			subs: String
		}
	],
	teams: [
		{
			rank: Number,
			teamName: String,
			school: String,
			overall: String,
			objs: String,
			subs: String,
			id: String,
			division: String
		}
	]
});

module.exports = mongoose.model('Match', MatchSchema);