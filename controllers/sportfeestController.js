var Sportfeest = require('../models/sportfeest');
var Wedstrijd = require('../models/wedstrijd');
var Locatie = require('../models/locatie');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Lijst van alle sportfeesten weergeven
exports.sportfeest_list = function (req, res, next) {
    Sportfeest.find()
        .populate('locatie')
        .sort({'datum':-1})
        .exec(function (err, list_sportfeesten) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('sportfeest_list', { title: 'Alle sportfeesten', sportfeest_list: list_sportfeesten });
        });
}

// Specifiek sportfeest weergeven
exports.sportfeest_detail = function (req, res, next) {
    async.parallel({
        sportfeest: function (callback) {
            Sportfeest.findById(req.params.id)
                .populate('locatie')
                .exec(callback);
        },
        sportfeest_wedstrijden: function (callback) {
            Wedstrijd.find({'sportfeest': req.params.id })
                .populate('discipline')
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.sportfeest == null) { // No results.
            var err = new Error('Sportfeest not found');
            err.status = 404;
            return next(err);
        }

        // Successful, so render
        res.render('sportfeest_detail', { title: 'Sportfeest Details', sportfeest: results.sportfeest, sportfeest_wedstrijden: results.sportfeest_wedstrijden, authenticated: req.isAuthenticated() });
    });
};

// Weergeven create form bij GET
exports.sportfeest_create_get = function (req, res, next) {

    Locatie
        .find()
        .sort('naam')
        .exec(function (err, locaties) {
            if (err) { return next(err); }
            // Successful, so render.
            res.render('sportfeest_form', { title: 'Toevoegen sportfeest', locatie_list: locaties });
        });

};

// Verwerken create form bij POST
exports.sportfeest_create_post = [

    // Validate fields.
    body('locatie', 'Locatie is verplicht').isLength({ min: 1 }).trim(),
    body('datum', 'Ongeldige Datum').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('locatie').trim().escape(),
    sanitizeBody('datum').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a BookInstance object with escaped and trimmed data.
        var sportfeest = new Sportfeest(
            {
                locatie: req.body.locatie,
                datum: req.body.datum,
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            Locatie
                .find()
                .sort('naam')
                .exec(function (err, books) {
                    if (err) { return next(err); }
                    // Successful, so render.
                    res.render('sportfeest_form', { title: 'Toevoegen sportfeest', locatie_list: locaties, errors: errors.array(), sportfeest: sportfeest });
                });
            return;
        }
        else {
            // Data from form is valid.
            Sportfeest
                .findOne({ 'locatie': req.body.locatie, 'datum': req.body.datum })
                .exec(function (err, found_sportfeest) {

                    if (err) { return next(err); }

                    if (found_sportfeest) {

                         res.redirect(found_sportfeest.url)
                    }


                    else {
                        sportfeest.save(function (err) {
                            if (err) { return next(err); }
                            // Successful - redirect to new record.
                            res.redirect(sportfeest.url);
                        });
                    }
                });
        }
    }
];

// Weergeven delete form bij GET
exports.sportfeest_delete_get = function (req, res, next) {

    async.parallel({
        sportfeest: function (callback) {
            Sportfeest
                .findById(req.params.id)
                .populate('locatie')
                .exec(callback)
        },
        sportfeest_wedstrijden: function (callback) {
            Wedstrijd
                .find({ 'sportfeest': req.params.id })
                .populate('discipline')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.sportfeest == null) { // No results.
            res.redirect('/menu/sportfeesten');
        }
        // Successful, so render.
        res.render('sportfeest_delete', { title: 'Verwijderen sportfeest', sportfeest: results.sportfeest, sportfeest_wedstrijden: results.sportfeest_wedstrijden });
    });

};

// Verwerken delete form bij POST
exports.sportfeest_delete_post = function (req, res, next) {

    async.parallel({
        sportfeest: function (callback) {
            Sportfeest
                .findById(req.params.id)
                .populate('locatie')
                .exec(callback)
        },
        sportfeest_wedstrijden: function (callback) {
            Wedstrijd
                .find({ 'sportfeest': req.params.id })
                .populate('discipline')
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        if (results.sportfeest_wedstrijden.length > 0) {
            res.render('sportfeest_delete', { title: 'Verwijderen sportfeest', sportfeest: results.sportfeest, sportfeest_wedstrijden: results.sportfeest_wedstrijden });
            return;
        }
        else {
            Sportfeest.findByIdAndRemove(req.body.sportfeestid, function deleteSportfeest(err) {
                if (err) { return next(err); }
                res.redirect('/menu/sportfeesten')
            })
        }
    });
};

// Weergeven wedstrijd update form bij GET
exports.sportfeest_update_get = function (req, res, next) {
    async.parallel({
        sportfeest: function (callback) {
            Sportfeest
                .findById(req.params.id)
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .populate('discipline')
                .exec(callback);
        },
        locaties: function (callback) {
            Locatie
                .find()
                .populate('locatie')
                .sort('datum')
                .exec(callback);
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.sportfeest == null) { // No results.
            var err = new Error('Sportfeest not found');
            err.status = 404;
            return next(err);
        }
        // Success.

        res.render('sportfeest_form', { title: 'Update sportfeest', locatie_list: results.locaties, sportfeest: results.sportfeest });
    });

};

// Verwerken update form bij POST
exports.sportfeest_update_post = [

    // Validate fields.
    body('locatie', 'Locatie is verplicht').isLength({ min: 1 }).trim(),
    body('datum', 'Ongeldige Datum').optional({ checkFalsy: true }).isISO8601(),

    // Sanitize fields.
    sanitizeBody('locatie').trim().escape(),
    sanitizeBody('datum').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an object with escaped/trimmed data and old id.
        var sportfeest = new Sportfeest(
            {
                locatie: req.body.locatie,
                datum: req.body.datum,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all sportfeesten and disciplines for form.
            async.parallel({
                sportfeest: function (callback) {
                    Sportfeest
                        .findById(req.params.id)
                        .populate('sportfeest')
                        .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                        .populate('discipline')
                        .exec(callback);
                },
                locaties: function (callback) {
                    Locatie
                        .find()
                        .populate('locatie')
                        .sort('datum')
                        .exec(callback);
                },
            }, function (err, results) {
                if (err) { return next(err); }

                res.render('sportfeest_form', { title: 'Update sportfeest', locatie_list: results.locaties, sportfeest: results.sportfeest, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Sportfeest.findByIdAndUpdate(req.params.id, sportfeest, {}, function (err, hetsportfeest) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(hetsportfeest.url);
            });
        }
    }
];
