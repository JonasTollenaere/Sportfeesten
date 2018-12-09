#! /usr/bin/env node

console.log('This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: populatedb mongodb://your_username:your_password@your_dabase_url');

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
if (!userArgs[0].startsWith('mongodb://')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}

var async = require('async')
var Speler = require('./models/speler')
var Wedstrijd = require('./models/wedstrijd')
var Discipline = require('./models/discipline')
var Locatie = require('./models/locatie')
var Sportfeest = require('./models/sportfeest')
var Deelname = require('./models/deelname')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
var db = mongoose.connection;
mongoose.connection.on('error', console.error.bind(console, 'MongoDB connection error:'));


function start(cb) {
    var sportfeestID = "5c0beed67c632238ec485b67";
    async.parallel({
        disciplines: function (callback) {
            Discipline.find().exec(callback);
        },
        spelers: function (callback) {
            Speler.find().exec(callback);
        }

    }, function (err, results) {
        if (err) { return next(err); }
        results.disciplines.forEach(function maakWedstrijd(discipline) {
            if (Math.random() < 0.9) {
                var wedstrijd = new Wedstrijd(
                    {
                        sportfeest: sportfeestID,
                        discipline: discipline,
                    });
                wedstrijd.save(function (err) {
                    if (err) { return next(err); }
                });
                results.spelers.forEach(function maakDeelnames(speler) {
                    if (Math.random() < 0.75) {
                        var deelname = new Deelname({
                            wedstrijd: wedstrijd,
                            speler: speler,
                            score: parseInt(Math.random() * 15 + 5)
                        });
                        deelname.save(function (err) {
                            if (err) { return next(err); }
                        });
                    }
                });
            }
        });

        
        
    });
}


async.series([

    start
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




