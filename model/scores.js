'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScoresSchema = new Schema({
	category: String,
	decathlete: String,
	overall: String
});

module.exports = mongoose.model('Scores', ScoresSchema);