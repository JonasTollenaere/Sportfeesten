var Wedstrijd = require('../models/wedstrijd');
var Discipline = require('../models/discipline');
var Deelname = require('../models/deelname');
var Sportfeest = require('../models/sportfeest');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');


// Menu home page   -   -   -   -   -   -   -       -   -   -   -   -   -   -   -       -   -   -   - later anders
exports.index = function (req, res) {
    res.send('Nog niet geïmplementeerd: Menu home page/ menu/index');
};

// Lijst van alle wedstrijden weergeven
exports.wedstrijd_list = function (req, res) {
    Wedstrijd.find()
        .populate('sportfeest')
        .populate({ path: 'sportfeest', populate: {path:'locatie'}})
        .populate('discipline')
        .exec(function (err, list_wedstrijden) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('wedstrijd_list', { title: 'Wedstrijden', wedstrijd_list: list_wedstrijden });
        });

};

// Specifieke wedstrijd weergeven
exports.wedstrijd_detail = function (req, res, next) {
    async.parallel({
        wedstrijd: function (callback) {
            Wedstrijd.findById(req.params.id)
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .populate('discipline')
                .exec(callback);
        },

        wedstrijd_deelnames: function (callback) {
            Deelname.find({ 'wedstrijd': req.params.id })
                .populate('wedstrijd')
                .populate('speler')
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.wedstrijd == null) { // No results.
            var err = new Error('Wedstrijd not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('wedstrijd_detail', { title: 'Wedstrijd Details', wedstrijd: results.wedstrijd, wedstrijd_deelnames: results.wedstrijd_deelnames });
    });
};

// Weergeven wedstrijd create form bij GET
exports.wedstrijd_create_get = function (req, res, next) {

    async.parallel({
        sportfeesten: function (callback) {
            Sportfeest
                .find()
                .populate('locatie')
                .sort('datum')
                .exec(callback);
        },
        disciplines: function (callback) {
            Discipline
                .find(callback)
                .sort('naam');
        },
    }, function (err, results) {
        if (err) { return next(err); }
        res.render('wedstrijd_form', { title: 'Toevoegen wedstrijd', sportfeesten: results.sportfeesten, disciplines: results.disciplines });
    });

};

// Verwerken wedstrijd create form bij post
exports.wedstrijd_create_post = [
    
    // Sanitize fields.
    sanitizeBody('sportfeest').trim().escape(),
    sanitizeBody('discipline').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Creëer wedstrijd object met deze data
        var wedstrijd = new Wedstrijd(
            {
                sportfeest: req.body.sportfeest,
                discipline: req.body.discipline
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values and error messages.
            async.parallel({
                sportfeesten: function (callback) {
                    Sportfeest
                        .find()
                        .populate('locatie')
                        .sort('datum')
                        .exec(callback);
                },
                disciplines: function (callback) {
                    Discipline
                        .find(callback)
                        .sort('naam');
                },
            }, function (err, results) {
                if (err) { return next(err); }
                res.render('wedstrijd_form', { title: 'Toevoegen wedstrijd', sportfeesten: results.sportfeesten, disciplines: results.disciplines, wedstrijd: wedstrijd });
            });
        }
        else {
            // Data from form is valid.
            Wedstrijd
                .findOne({ 'sportfeest': req.body.sportfeest, 'discipline': req.body.discipline })
                .exec(function (err, found_wedstrijd) {

                    if (err) { return next(err);}

                    if (found_wedstrijd) {
                        res.redirect(found_wedstrijd.url)
                    }


                    else {
                        wedstrijd.save(function (err) {
                            if (err) { return next(err); }
                            // Successful - redirect to new record.
                            res.redirect(wedstrijd.url);
                        });
                    }
                });
        }
    }
];

// Weergeven wedstrijd delete form bij GET
exports.wedstrijd_delete_get = function (req, res, next) {
    async.parallel({
        wedstrijd: function(callback) {
            Wedstrijd
                .findById(req.params.id)
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .populate('discipline')
                .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        if (results.wedstrijd==null) { // No results.
            res.redirect('/menu/wedstrijden');
        }
        // Successful, so render.
        res.render('wedstrijd_delete', { title: 'Verwijder wedstrijd', wedstrijd: results.wedstrijd } );
    });
}

// Verwerken wedstrijd delete form bij POST
exports.wedstrijd_delete_post = function (req, res, next) {

    async.parallel({
        wedstrijd: function (callback) {
            Wedstrijd
                .findById(req.params.id)
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .populate('discipline')
                .exec(callback)
        },
        wedstrijd_deelnames: function (callback) {
            Deelname.find({ 'wedstrijd': req.body.wedstrijdid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        // Success
        // Verwijderen alle deelnames voor de te verwijderen wedstrijd
        results.wedstrijd_deelnames.forEach(function (deelname, err) {
            Deelname.findByIdAndRemove(deelname._id, function deleteDeelname(err) {
                if (err) {
                    return next(err);
                }
            });

        });
        // Verwijderen wedstrijd
        Wedstrijd.findByIdAndRemove(req.body.wedstrijdid, function deleteWedstrijd(err) {
            if (err) { return next(err); }
            res.redirect('/menu');
        });
        
    });
};

// Weergeven wedstrijd update form bij GET
exports.wedstrijd_update_get = function (req, res, next) {
    async.parallel({
        wedstrijd: function (callback) {
            Wedstrijd
                .findById(req.params.id)
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .populate('discipline')
                .exec(callback);
        },
        sportfeesten: function (callback) {
            Sportfeest
                .find()
                .populate('locatie')
                .sort('datum')
                .exec(callback);
        },
        disciplines: function (callback) {
            Discipline
                .find(callback)
                .sort('naam');
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.wedstrijd == null) { // No results.
            var err = new Error('Wedstrijd not found');
            err.status = 404;
            return next(err);
        }
        // Success.
              
        res.render('wedstrijd_form', { title: 'Update wedstrijd', sportfeesten: results.sportfeesten, disciplines: results.disciplines, wedstrijd: results.wedstrijd });
    });

};

// Verwerken update form bij POST
exports.wedstrijd_update_post = [
    
    // Sanitize fields.
    sanitizeBody('sportfeest').trim().escape(),
    sanitizeBody('discipline').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create an object with escaped/trimmed data and old id.
        var wedstrijd = new Wedstrijd(
            {
                sportfeest: req.body.sportfeest,
                discipline: req.body.discipline,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all sportfeesten and disciplines for form.
            async.parallel({
                sportfeesten: function (callback) {
                    Sportfeest
                        .find()
                        .populate('locatie')
                        .sort('datum')
                        .exec(callback);
                },
                disciplines: function (callback) {
                    Discipline
                        .find(callback)
                        .sort('naam');
                },
            }, function (err, results) {
                if (err) { return next(err); }
                
                res.render('wedstrijd_form', { title: 'Update wedstrijd', sportfeesten: results.sportfeesten, disciplines: results.disciplines, wedstrijd: results.wedstrijd, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Wedstrijd.findByIdAndUpdate(req.params.id, wedstrijd, {}, function (err, dewedstrijd) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect(dewedstrijd.url);
            });
        }
    }
];

