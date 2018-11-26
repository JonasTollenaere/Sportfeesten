var Deelname = require('../models/deelname');
var Speler = require('../models/speler');
var Wedstrijd = require('../models/wedstrijd');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Lijst van alle deelnames weergeven
exports.deelname_list = function (req, res) {
    Deelname.find()
        .populate('speler')
        .populate('wedstrijd')
        .populate({ path: 'wedstrijd', populate: { path: 'sportfeest' } })
        .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', populate: { path: 'locatie' } } })
        .populate({ path: 'wedstrijd', populate: { path: 'discipline' } })
        .exec(function (err, list_deelnames) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('deelname_list', { title: 'Deelnames', deelname_list: list_deelnames });
        });

};

// Specifieke deelname weergeven
exports.deelname_detail = function (req, res, next) {
    Deelname.findById(req.params.id)
        .populate('speler')
        .populate('wedstrijd')
        .populate({ path: 'wedstrijd', populate: { path: 'sportfeest' }})
        .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', populate: { path:'locatie'}}})
        .populate({ path: 'wedstrijd', populate: { path: 'discipline' } })
        .exec(function (err, deelname) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('deelname_detail', { title: 'Deelnames', deelname: deelname });
        });
};

// Deelname create form weergeven bij GET
exports.deelname_create_get = function (req, res, next) {

    // Alle spelers en wedstrijden ophalen
    async.parallel({
        spelers: function (callback) {
            Speler
                .find(callback)
                .populate('thuislocatie');
        },
        wedstrijden: function (callback) {
            Wedstrijd
                .find(callback)
                .populate('discipline')
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } });
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('deelname_form', { title: 'Deelname toevoegen', spelers: results.spelers, wedstrijden: results.wedstrijden });
    });

}

// Verwerken create form bij POST
exports.deelname_create_post = [

    // Validate fields.
    body('wedstrijd', 'Wedstrijd is verplicht').isLength({ min: 1 }).trim(),
    body('speler', 'Speler is verplicht').isLength({ min: 1 }).trim(),
    body('score', 'Score is verplicht').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('wedstrijd').trim().escape(),
    sanitizeBody('speler').trim().escape(),
    sanitizeBody('score').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Deelname object with escaped and trimmed data.
        var deelname = new Deelname(
            {
                wedstrijd: req.body.wedstrijd,
                speler: req.body.speler,
                score: req.body.score

            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            // Get spelers en wedstrijden
            async.parallel({
                spelers: function (callback) {
                    Speler
                        .find(callback)
                        .populate('thuislocatie');
                },
                wedstrijden: function (callback) {
                    Wedstrijd
                        .find(callback)
                        .populate('discipline')
                        .populate('sportfeest')
                        .populate({ path: 'sportfeest', populate: { path: 'locatie' } });
                },
            }, function (err, results) {
                if (err) {
                    return next(err);
                    res.render('deelname_form', { title: 'Toevoegen deelname', spelers: results.spelers, wedstrijden: results.wedstrijden, deelname: deelname, errors: errors.array() });
                }
            });
            return;
        }
        else {
            // Data from form is valid. Save book.
            Deelname
                .findOne({ 'wedstrijd': req.body.wedstrijd, 'speler': req.body.speler })
                .exec(function (err, found_deelname) {

                    if (err) { return next(err); }

                    if (found_deelname) {
                        res.redirect(found_deelname.url)
                    }


                    else {
                        deelname.save(function (err) {
                            if (err) { return next(err); }
                            // Successful - redirect to new record.
                            res.redirect(deelname.url);
                        });
                    }
                });
        }
    }
];

// Weergeven deelname delete form bij GET
exports.deelname_delete_get = function (req, res, next) {
    async.parallel({
        deelname: function (callback) {
            Deelname
                .findById(req.params.id)
                .populate('speler')
                .populate('wedstrijd')
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest' } })
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', populate: { path: 'locatie' } } })
                .populate({ path: 'wedstrijd', populate: { path: 'discipline' } })
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.deelname == null) { // No results.
            res.redirect('/menu/deelnames');
        }
        // Successful, so render.
        res.render('deelname_delete', { title: 'Verwijder deelname', deelname: results.deelname });
    });

};

// Verwerken deelname delete bij POST
exports.deelname_delete_post = function (req, res, next) {

    async.parallel({
        deelname: function (callback) {
            Deelname
                .findById(req.body.deelnameid)
                .populate('speler')
                .populate('wedstrijd')
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest' } })
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest', populate: { path: 'locatie' } } })
                .populate({ path: 'wedstrijd', populate: { path: 'discipline' } })
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        else {
            // Author has no books. Delete object and redirect to the list of authors.
            Deelname.findByIdAndRemove(req.body.deelnameid, function deleteDeelname(err) {
                if (err) { return next(err); }
                // Success - go to author list
                res.redirect('/menu/deelnames')
            })
        }
    });
};

// Weergeven deelname update form bij GET
exports.deelname_update_get = function (req, res, next) {
    async.parallel({
        deelname: function (callback) {
            Deelname
                .findById(req.params.id)
                .populate('wedstrijd')
                .populate({ path: 'wedstrijd', populate: { path: 'sportfeest' } })
                .populate('speler')
                .exec(callback);
        },
        wedstrijden: function (callback) {
            Wedstrijd
                .find(callback)
                .populate('discipline')
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } });
        },
        spelers: function (callback) {
            Speler
                .find(callback)
                .populate('thuislocatie')
                .sort('naam');
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.deelname == null) { // No results.
            var err = new Error('Deelname not found');
            err.status = 404;
            return next(err);
        }
        // Success.

        res.render('deelname_form', { title: 'Update deelname', spelers: results.spelers, wedstrijden: results.wedstrijden, deelname: results.deelname });
    });

};

// Verwerken update form bij POST
exports.deelname_update_post = [

    // Validate fields.
    body('wedstrijd', 'Wedstrijd is verplicht').isLength({ min: 1 }).trim(),
    body('speler', 'Speler is verplicht').isLength({ min: 1 }).trim(),
    body('score', 'Score is verplicht').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('wedstrijd').trim().escape(),
    sanitizeBody('speler').trim().escape(),
    sanitizeBody('score').trim().escape(),
    
    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an object with escaped/trimmed data and old id.
        var deelname = new Deelname(
            {
                wedstrijd: req.body.wedstrijd,
                speler: req.body.speler,
                score: req.body.score,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all wedstrijden and spelers for form.
            async.parallel({
                wedstrijden: function (callback) {
                    Wedstrijd
                        .find(callback)
                        .populate('discipline')
                        .populate('sportfeest')
                        .populate({ path: 'sportfeest', populate: { path: 'locatie' } });
                },
                spelers: function (callback) {
                    Speler
                        .find(callback)
                        .populate('thuislocatie')
                        .sort('naam');
                },
            }, function (err, results) {
                if (err) { return next(err); }

                res.render('deelname_form', { title: 'Update deelname', spelers: results.spelers, wedstrijden: results.wedstrijden, deelname: deelname, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Deelname.findByIdAndUpdate(req.params.id, deelname, {}, function (err, dedeelname) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(dedeelname.url);
            });
        }
    }
];
