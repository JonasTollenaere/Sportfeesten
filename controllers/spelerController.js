var Speler = require('../models/speler');
var Locatie = require('../models/locatie');
var Deelname = require('../models/deelname');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Lijst van alle spelers weergeven
exports.speler_list = function (req, res, next) {
    Speler.find()
        .sort('achternaam')
        .populate('thuislocatie')
        .exec(function (err, list_spelers) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('speler_list', { title: 'Spelers', speler_list: list_spelers });
        });

};

// Specifieke speler weergeven
exports.speler_detail = function (req, res, next) {
    async.parallel({
        speler: function (callback) {
            Speler.findById(req.params.id)
                .populate('thuislocatie')
                .exec(callback);
        },

        speler_deelnames: function (callback) {
            Deelname.find({ 'speler': req.params.id })
                .populate('wedstrijd')
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', sort: [['datum']]   }})
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', populate: { path: 'locatie' } } })
                .populate({ path: 'wedstrijd', populate: { path: 'discipline' } })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.speler == null) { // No results.
            var err = new Error('Speler not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('speler_detail', { title: 'Speler Details', speler: results.speler, speler_deelnames: results.speler_deelnames, authenticated: req.isAuthenticated()});
    });
};

// Weergeven speler create form bij GET
exports.speler_create_get = function (req, res, next) {

    Locatie
        .find()
        .exec(function (err, locaties) {
            if (err) { return next(err); }
            //Renderen indien succesvol
            res.render('speler_form', { title: 'Toevoegen speler', locatie_list: locaties });
        });
}

// Verwerken speler create form bij POST
exports.speler_create_post = [

    // Validate fields.
    body('voornaam', 'Voornaam invoeren is verplicht.').isLength({ min: 1 }).trim(),
    body('achternaam', 'Achternaam invoeren is verplicht.').isLength({ min: 1 }).trim(),
    body('geboortedatum', 'Datum is verplicht.').isLength({ min: 1 }).trim(),
    body('geboortedatum', 'Ongeldige datum.').optional({ checkFalsy: true }).isISO8601(),


    // Sanitize fields.
    sanitizeBody('voornaam').trim().escape(),
    sanitizeBody('achternaam').trim().escape(),
    sanitizeBody('thuislocatie').trim().escape(),
    sanitizeBody('geboortedatum').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var speler = new Speler(
            {
                voornaam: req.body.voornaam,
                achternaam: req.body.achternaam,
                thuislocatie: req.body.thuislocatie,
                geboortedatum: req.body.geboortedatum,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            async.parallel({
                speler: function (callback) {
                    Speler
                        .findById(req.params.id)
                        .populate('thuislocatie')
                        .exec(callback)
                },
                locaties: function (callback) {
                    Locatie
                        .find()
                        .exec(callback)
                },
            }, function (err, results) {
                    if (err) { return next(err); }
                    res.render('speler_form', {
                        title: 'Toevoegen Speler', locatie_list: results.locaties, selected_locatie: speler.thuislocatie._id, errors: errors.array(), speler: speler
                    });
            });
        }
        else {
            // Data from form is valid.
            // Check if Speler with same names and location already exists.
            Speler.findOne({ 'voornaam': req.body.naam, 'achternaam': req.body.achternaam, 'locatie': req.body.locatie})
                .exec(function (err, found_speler) {
                    if (err) { return next(err); }

                    if (found_speler) {
                        //Speler met zelfde naam en locatie bestaat al, doorsturen naar detailpagina
                        res.redirect(found_speler.url);
                    }
                    else {
                        speler.save(function (err) {
                            if (err) { return next(err); }
                            // Successful - redirect to new speler record.
                            res.redirect(speler.url);
                        });
                    }
                });
        }
    }
];

// Weergeven wedstrijd delete form bij GET
exports.speler_delete_get = function (req, res, next) {
    async.parallel({
        speler: function (callback) {
            Speler
                .findById(req.params.id)
                .populate('thuislocatie')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.speler == null) { // No results.
            res.redirect('/menu/spelers');
        }
        // Successful, so render.
        res.render('speler_delete', { title: 'Verwijder speler', speler: results.speler });
    });
}

// Verwerken wedstrijd delete form bij POST
exports.speler_delete_post = function (req, res, next) {

    async.parallel({
        speler: function (callback) {
            Speler
                .findById(req.params.id)
                .populate('thuislocatie')
                .exec(callback)
        },
        speler_deelnames: function (callback) {
            Deelname.find({ 'speler': req.body.spelerid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        // Verwijderen alle deelnames voor de te verwijderen speler
        results.speler_deelnames.forEach(function (deelname, err) {
            Deelname.findByIdAndRemove(deelname._id, function deleteDeelname(err) {
                if (err) {
                    return next(err);
                }
            });

        });
        // Verwijderen speler
        Speler.findByIdAndRemove(req.body.spelerid, function deleteSpeler(err) {
            if (err) { return next(err); }
            res.redirect('/menu/spelers');
        });

    });
};

// Weergeven update form bij GET
exports.speler_update_get = function (req, res, next) {
    async.parallel({
        speler: function (callback) {
            Speler
                .findById(req.params.id)
                .populate('locatie')
                .exec(callback);
        },
        locaties: function (callback) {
            Locatie
                .find(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.speler == null) { // No results.
            var err = new Error('Speler not found');
            err.status = 404;
            return next(err);
        }
        // Success.
        
        res.render('speler_form', { title: 'Update Speler', locatie_list: results.locaties, speler: results.speler });
    });

};

// Verwerken update form bij POST
exports.speler_update_post = [

    // Validate fields.
    body('voornaam', 'Voornaam invoeren is verplicht.').isLength({ min: 1 }).trim(),
    body('achternaam', 'Achternaam invoeren is verplicht.').isLength({ min: 1 }).trim(),
    body('geboortedatum', 'Datum is verplicht.').isLength({ min: 1 }),
    body('geboortedatum', 'Ongeldige datum.').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('voornaam').trim().escape(),
    sanitizeBody('achternaam').trim().escape(),
    sanitizeBody('thuislocatie').trim().escape(),
    sanitizeBody('geboortedatum').toDate(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var speler = new Speler(
            {
                voornaam: req.body.voornaam,
                achternaam: req.body.achternaam,
                thuislocatie: req.body.thuislocatie,
                geboortedatum: req.body.geboortedatum,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                locaties: function (callback) {
                    Locatie
                        .find(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }
                res.render('speler_form', { title: 'Update Speler', locatie_list: results.locaties, speler: speler, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Speler.findByIdAndUpdate(req.params.id, speler, {}, function (err, despeler) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(despeler.url);
            });
        }
    }
];

