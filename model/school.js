'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SchoolSchema = new Schema({
	name: String,
	city: String,
	state: String,
	region: String,
	district: String,
	seasons: [
		{
			year: String,
			roundOne: String,
			roundOneId: String,
			regional: String,
			regionalId: String,
			state: String,
			stateId: String,
			national: String,
			nationalId: String
		}
	]
});

module.exports = mongoose.model('School', SchoolSchema);