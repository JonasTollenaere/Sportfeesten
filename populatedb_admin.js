#! /usr/bin/env node

console.log('This script populates the database with admin profiles');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Gebruiker = require('./models/gebruiker')



var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));

var gebruikers = [];

function gebruikerCreate(naam, wachtwoord, cb) {
    Gebruiker.register(new Gebruiker({username:naam}),wachtwoord, cb)
}

function createGebruikers(cb) {
    async.parallel([
        function(callback) {
            gebruikerCreate("Jonas T", "Konijn", callback);
        },
        function(callback) {
            gebruikerCreate("Elien M", "Elienelientje" , callback);
        },
        function (callback) {
            gebruikerCreate("Vincent N", "Internetapplicaties", callback);
        },
        function (callback) {
            gebruikerCreate("Ilse B", "Internetapplicaties", callback);
        },
        ],
        // optional callback
        cb);
}


async.series([
    createGebruikers
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else { 
    }
    // All done, disconnect from database
    mongoose.connection.close();
});




