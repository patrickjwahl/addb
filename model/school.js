'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SeasonSchema = new Schema({
	year: String,
	roundone: String,
	roundoneId: String,
	regionals: String,
	regionalsId: String,
	state: String,
	stateId: String,
	nationals: String,
	nationalsId: String
});

var TeamSchema = new Schema({
	teamName: String,
	seasons: [SeasonSchema]
});

var SchoolSchema = new Schema({
	name: String,
	fullName: String,
	city: String,
	state: String,
	region: String,
	district: String,
	teams: [TeamSchema]
});

module.exports = mongoose.model('School', SchoolSchema);