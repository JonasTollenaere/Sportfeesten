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

var spelers = []
var wedstrijden = []
var disciplines = []
var locaties = []
var sportfeesten = []
var deelnames = []

function locatieCreate(naam, provincie, postcode, beschrijving cb) {
    locatiedetail = { naam: naam, provincie: provincie, postcode:postcode, beschrijving: beschrijving }
  
  var locatie = new Locatie(locatiedetail);
       
  locatie.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('Nieuwe locatie: ' + locatie);
    locaties.push(locatie)
    cb(null, locatie)
  }  );
}

function disciplineCreate(naam, beschrijving, cb) {
    disciplinedetail = { naam: naam, beschrijving: beschrijving }
 
    var discipline = new Discipline(disciplinedetail);
       
  discipline.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
      console.log('Nieuwe discipline: ' + discipline);
      disciplines.push(discipline)
      cb(null, discipline);
  }   );
}

function spelerCreate(voornaam, achternaam, geboortedatum, thuislocatie, cb) {
   spelerdetail = { 
      voornaam: voornaam,
      achternaam: achternaam,
      geboortedatum: geboortedatum,
      thuislocatie: thuislocatie
  }
    
    var speler = new Speler(spelerdetail);    
  speler.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('Nieuwe Speler: ' + speler);
      spelers.push(speler)
      cb(null, speler)
  }  );
}

function sportfeestCreate(locatie, datum, cb) {
    sportfeestdetail = {
        locatie: locatie,
        datum: datum
    }

    var sportfeest = new Sportfeest(sportfeestdetail);
    sportfeest.save(function (err) {
        if (err) {
            cb(err, null)
            return
        }
        console.log('Nieuw Sportfeest: ' + sportfeest);
        sportfeesten.push(sportfeest)
        cb(null, sportfeest)
    });
}

function wedstrijdCreate(sportfeest, discipline, cb) {
  wedstrijddetail = { 
      sportfeest: sportfeest,
      discipline: discipline
  }    

    var wedstrijd = new Wedstrijd(wedstrijddetail);    
  wedstrijd.save(function (err) {
    if (err) {
        console.log('ERROR CREATING Wedstrijd: ' + wedstrijd);
      cb(err, null)
      return
    }
      console.log('Nieuwe Wedstrijd: ' + wedstrijd);
      wedstrijden.push(wedstrijd)
      cb(null, wedstrijd)
  }  );
}

function deelnameCreate(wedstrijd, speler, score, cb) {
    deelnamedetail = {
        wedstrijd: wedstrijd,
        speler: speler,
        score: score
    }

    var deelname = new Deelname(deelnamedetail);
    deelname.save(function(err) {
        if (err) {
            console.log('ERROR CREATING deelname: ' + deelname);
            cb(err, null)
            return
        }
        console.log('Nieuwe Deelname: ' + deelname);
        deelnames.push(deelname)
        cb(null, deelname)
    }  );
}

function createSpelers(cb) {
    async.parallel([
        function(callback) {
          spelerCreate('Alice', 'Van den Borre', '1988-06-06', locaties[0], callback);
        },
        function(callback) {
            spelerCreate('Cédric', 'Donderman', '1932-11-8', locaties[1], callback);
        },
        function(callback) {
            spelerCreate('Leen', 'Donderman', '1920-01-02', locaties[2], callback);
        },
        function(callback) {
            spelerCreate('Arne', 'Ongena', '1998-02-12', locaties[3], callback);
        },
        function(callback) {
            spelerCreate('Stef', 'Smet', '1971-12-16', locaties[4], callback);
        },
        function (callback) {
            spelerCreate('Ans', 'Van Dorpe', '1971-12-16', locaties[5], callback);
        },
        ],
        // optional callback
        cb);
}

/*
function createDisciplines(cb) {
    async.parallel([
        function(callback) {
         disciplineCreate("Touwtrekken", "Om ter neigst aan een touw trekken", callback);
        },
        function(callback) {
            disciplineCreate("Hardlopen", "Om ter snelst over de lijn lopen " , callback);
        },
        function (callback) {
            disciplineCreate("Vendelen", "Om ter mooist vendelen ", callback);
        },
        function (callback) {
            disciplineCreate("Touwtrekken 2", "Zoals touwtrekken, maar dan harder", callback);
        },
        ],
        // optional callback
        cb);
}
*/

function createLocaties(cb) {
    async.parallel([
        function(callback) {
            locatieCreate("Assenede","Oost-Vlaanderen", 9400, "Melige beschrijving nr.1",  callback)
        },
        function(callback) {
            locatieCreate("Nieuwkerken-Waas", "Oost-Vlaanderen", 9100, "Melige beschrijving nr.2", callback)
        },
        function (callback) {
            locatieCreate("Sinaai", "Oost-Vlaanderen", 9112, "Melige beschrijving nr.3", callback)
        },
        function (callback) {
            locatieCreate("Kemzeke", "Oost-Vlaanderen", 9190, "Melige beschrijving nr.4", callback)
        },
        function (callback) {
            locatieCreate("Sint-Niklaas", "Oost-Vlaanderen", 9100, "Melige beschrijving nr.5",  callback)
        }
        ],
        // Optional callback
        cb);
}
function createSportfeesten(cb) {
    async.parallel([
        function (callback) {
            sportfeestCreate(locaties[0], '2018-07-13', callback)
        },
        function (callback) {
            sportfeestCreate(locaties[1], '2018-08-13', callback)
        },
        function (callback) {
            sportfeestCreate(locaties[2], '2018-07-26', callback)
        },
        function (callback) {
            sportfeestCreate(locaties[3], '2018-07-23', callback)
        },
        function (callback) {
            sportfeestCreate(locaties[4], '2018-08-18', callback)
        },
    ],
        cb);
}

function createWedstrijden(cb) {
    async.parallel([
        function (callback) {
            wedstrijdCreate(sportfeesten[0], disciplines[0], callback)
        },
        function (callback) {
            wedstrijdCreate(sportfeesten[1], disciplines[1], callback)
        },
        function (callback) {
            wedstrijdCreate(sportfeesten[2], disciplines[2], callback)
        },
        function (callback) {
            wedstrijdCreate(sportfeesten[3], disciplines[3], callback)
        },
        function (callback) {
            wedstrijdCreate(sportfeesten[4], disciplines[2], callback)
        }
    ],
        // Optional callback
        cb);
}

function createDeelnames(cb) {
    async.parallel([
        function (callback) {
            deelnameCreate(wedstrijden[0], spelers[0], 15, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[0], spelers[1], 14, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[1], spelers[1], 15, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[2], spelers[2], 15, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[3], spelers[3], 15, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[4], spelers[4], 15, callback)
        },
        function (callback) {
            deelnameCreate(wedstrijden[0], spelers[2], 6, callback)
        },
    ],
        // Optional callback
        cb);
}


async.series([
    createLocaties,
    createDisciplines,
    createSpelers,
    createSportfeesten,
    createWedstrijden,
    createDeelnames
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




