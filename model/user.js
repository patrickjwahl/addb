'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    passhash: String,
    access: Number,
    canEdit: Boolean
});

module.exports = mongoose.model('User', UserSchema);