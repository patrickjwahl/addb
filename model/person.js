'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PersonSchema = new Schema({
    name: String,
    school: String,
    schoolId: String,
    fullSchool: String,
    city: String,
    state: String,
    seasons: [
        {
            year: String,
            roundone: String,
            roundoneId: String,
            roundoneGPA: String,
            regionals: String,
            regionalsId: String,
            regionalsGPA: String,
            state: String,
            stateId: String,
            stateGPA: String,
            nationals: String,
            nationalsId: String,
            nationalsGPA: String
        }
    ]
});

module.exports = mongoose.model('Person', PersonSchema);