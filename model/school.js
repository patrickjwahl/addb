'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchoolSchema = new Schema({
	name: String,
	fullName: String,
	city: String,
	state: String,
	region: String,
	district: String,
	seasons: [
		{
			year: String,
			roundone: String,
			roundoneId: String,
			regionals: String,
			regionalsId: String,
			state: String,
			stateId: String,
			nationals: String,
			nationalsId: String
		}
	]
});

module.exports = mongoose.model('School', SchoolSchema);