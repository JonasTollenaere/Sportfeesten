var Discipline = require('../models/discipline');
var Wedstrijd = require('../models/wedstrijd');
var Locatie = require('../models/locatie');
var Afbeelding = require('../models/afbeelding');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Lijst van alle disciplines weergeven
exports.discipline_list = function (req, res, next) {
    Discipline.find({}, 'naam beschrijving')
        .populate('discipline')
        .exec(function (err, list_disciplines) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('discipline_list', { title: 'Disciplines', discipline_list: list_disciplines });
        });
};

// Specifieke discipline weergeven
exports.discipline_detail = function (req, res, next) {

    async.parallel({
        discipline: function (callback) {
            Discipline
                .findById(req.params.id)
                .populate('afbeelding')
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.discipline == null) { // No results.
            var err = new Error('Discipline not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('discipline_detail', { title: 'Discipline Details', discipline: results.discipline });
    });
};

// Discipline create form weergeven
exports.discipline_create_get = function (req, res, next) {
    res.render('discipline_form', {title: 'Voeg discipline toe'})
};

// Verwerken discipline create post
exports.discipline_create_post = [

    // Validate that the name field is not empty.
    body('naam', 'Disciplinenaam is verplicht').isLength({ min: 1 }).trim(),
    body('beschrijving', 'Beschrijving is verplicht').isLength({ min: 1 }).trim(),

    // Sanitize (trim and escape) the name field.
    sanitizeBody('naam').trim().escape(),
    sanitizeBody('beschrijving').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Indien een afbeelding doorgestuurd werd, wordt er een nieuw afbeeldingsobject gemaakt
        var afbeelding;

        if (req.files.afbeelding) {
            if (['image/jpeg', 'image/png'].includes(req.files.afbeelding.mimetype)) {
                afbeelding = new Afbeelding({
                    data: req.files.afbeelding.data,
                    type: req.files.afbeelding.mimetype
                });
                afbeelding.save(function (err) {
                    if (err) { return next(err); };
                });
            }
            else body('afbeelding').custom(value => { return Promise.reject('Het doorgestuurde bestand is geen geldige afbeelding') });
        }

        // Create a discipline object with escaped and trimmed data.
        var discipline = new Discipline(
            {
                naam: req.body.naam,
                beschrijving: req.body.beschrijving,
                afbeelding: afbeelding
            }
        );


        if (!errors.isEmpty()) {
            // There are errors. Render the form again with sanitized values/error messages.
            res.render('discipline_form', { title: 'Voeg discipline toe', discipline: discipline, errors: errors.array() });
            return;
        }
        else {
            // Check if Discipline with same name already exists.
            Discipline.findOne({ 'naam': req.body.name })
                .exec(function (err, found_discipline) {
                    if (err) { return next(err); }

                    if (found_discipline) {
                        // Discipline exists, redirect to its detail page.
                        res.redirect(found_discipline.url);
                    }
                    else {
                        discipline.save(function (err) {
                            if (err) { return next(err); }
                            // Discipline saved. Redirect to discipline detail page.
                            res.redirect(discipline.url);
                        });

                    }

                });
        }
    }
];

// Weergeven discipline delete form bij GET
exports.discipline_delete_get = function(req, res, next) {

    async.parallel({
        discipline: function (callback) {
            Discipline.findById(req.params.id).exec(callback)
        },
        discipline_wedstrijden: function (callback) {
            Wedstrijd
                .find({ 'discipline': req.params.id })
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .exec(callback)
        },
       
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.discipline == null) {
            res.redirect('/menu/disciplines');
        }
        res.render('discipline_delete', {
            title: 'Verwijder Discipline', discipline: results.discipline, discipline_wedstrijden: results.discipline_wedstrijden
        });
        
    });
};

// Verwerken discipline delete form bij POST
exports.discipline_delete_post = function (req, res, next) {

    async.parallel({
        discipline: function (callback) {
            Discipline
                .findById(req.body.disciplineid)
                .populate('afbeelding')
                .exec(callback)
        },
        discipline_wedstrijden: function (callback) {
            Wedstrijd
                .find({ 'discipline': req.params.id })
                .populate('sportfeest')
                .populate({ path: 'sportfeest', populate: { path: 'locatie' } })
                .exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.discipline_wedstrijden.length > 0) {
            res.render('discipline_delete', {
                title: 'Verwijder Discipline', discipline: results.discipline, discipline_wedstrijden: results.discipline_wedstrijden
            });
            return;
        }
        else {

            // Verwijderen afbeelding van te verwijderen discipline
            if (results.discipline.afbeelding) {
                Afbeelding.findByIdAndRemove(results.discipline.afbeelding._id, function deleteAfbeelding(err) {
                    if (err) { return next(err); }
                });
            }

            Discipline.findByIdAndRemove(req.body.disciplineid, function deleteDiscipline(err) {
                if (err) { return next(err); }
                // Success - go to discipline list
                res.redirect('/menu/disciplines')
            })
        }
    });

};

// Weergeveven update form bij GET
exports.discipline_update_get = function (req, res, next) {
    Discipline
        .findById(req.params.id)
        .exec(function (err, discipline) {
            if (err) { return next(err); }
            if (discipline == null) { // No results.
                var err = new Error('Discipline not found');
                err.status = 404;
                return next(err);
            }
            else {
                res.render('discipline_form', { title: 'Wijzigen discipline', discipline: discipline })
            }
        });
}

// Verwerken update form bij POST
exports.discipline_update_post = [

    // Validate fields.
    body('naam', 'Naam is verplicht.').isLength({ min: 1 }).trim(),
    body('beschrijving', 'Beschrijving is verplicht').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('naam').trim().escape(),
    sanitizeBody('beschrijving').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Indien een afbeelding doorgestuurd werd, wordt er een nieuw afbeeldingsobject gemaakt en het oude verwijderd uit de database, anders wordt de oude afbeelding opgehaald
        var afbeelding;
        if (req.files.afbeelding) {
            if (['image/jpeg', 'image/png'].includes(req.files.afbeelding.mimetype)) {
                afbeelding = new Afbeelding({
                    data: req.files.afbeelding.data,
                    type: req.files.afbeelding.mimetype
                });
                afbeelding.save(function (err) {
                    if (err) { return next(err); };
                });
                // Verwijderen oude afbeelding uit database
                Discipline
                    .findById(req.params.id)
                    .populate('afbeelding')
                    .exec(function (err, discipline) {
                        if (err) { return next(err); }
                        else {
                            if (discipline.afbeelding) {
                                Afbeelding.findByIdAndRemove(discipline.afbeelding._id, function deleteAfbeelding(err) {
                                    if (err) { return next(err); }
                                });
                            }
                        }
                    });

            }
            else body('afbeelding').custom(value => { return Promise.reject('Het doorgestuurde bestand is geen geldige afbeelding') });
        }
        else {
            Discipline
                .findById(req.params.id)
                .populate('afbeelding')
                .exec(function (err, discipline) {
                    if (err) { return next(err); }
                    else {
                        afbeelding = discipline.afbeelding
                    }
                });
        }

        var discipline = new Discipline(
            {
                naam: req.body.naam,
                beschrijving: req.body.beschrijving,
                afbeelding: afbeelding,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('discipline_form', { title: 'Wijzigen discipline', discipline: discipline, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Discipline.findByIdAndUpdate(req.params.id, discipline, {}, function (err, dediscipline) {
                if (err) { return next(err); }
                // Successful - redirect to discipline detail page.
                res.redirect(dediscipline.url);
            });
        }
    }
];
