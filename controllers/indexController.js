var Wedstrijd = require('../models/wedstrijd');
var Locatie = require('../models/locatie');
var Discipline = require('../models/discipline');
var Speler = require('../models/speler');

var async = require('async');

// Menu home page
exports.index = function (req, res) {
    async.parallel({
        locatie_count: function (callback) {
            Locatie.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
        },
        discipline_count: function (callback) {
            Discipline.countDocuments({}, callback);
        },
        //  book_instance_available_count: function (callback) {
        //    BookInstance.countDocuments({ status: 'Available' }, callback);
        //},
        speler_count: function (callback) {
            Speler.countDocuments({}, callback);
        },
        wedstrijd_count: function (callback) {
            Wedstrijd.countDocuments({}, callback);
        }
    }, function (err, results) {
        res.render('index', { title: 'Sportfeesten KLJ', error: err, data: results });
    });
};
