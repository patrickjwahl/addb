'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EditSchema = new Schema({
    user: String,
    datetime: Date,
    summary: String
});

module.exports = mongoose.model('Edit', EditSchema);