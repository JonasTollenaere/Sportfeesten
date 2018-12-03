var Locatie = require('../models/locatie');
var Speler = require('../models/speler');
var Sportfeest = require('../models/sportfeest');
var Afbeelding = require('../models/afbeelding');

var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Lijst van alle locaties weergeven
exports.locatie_list = function (req, res, next) {
    Locatie.find({}, 'naam provincie')
        .populate('locatie')
        .exec(function (err, list_locaties) {
            if (err) { return next(err); }
            //Successful, so render
            res.render('locatie_list', { title: 'Locaties', locatie_list: list_locaties });
        });
};

// Specifieke locatie weergeven
exports.locatie_detail = function (req, res, next) {
    async.parallel({
        locatie: function (callback) {
            Locatie
                .findById(req.params.id)
                .populate('afbeelding')
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.locatie == null) { // No results.
            var err = new Error('Locatie not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('locatie_detail', { title: 'Locatie Details', locatie: results.locatie, authenticated: req.isAuthenticated()});
    });
};

// Weergeven locatie create form
exports.locatie_create_get = function (req, res, next) {
    res.render('locatie_form', { title: 'Toevoegen Locatie' });
}

// Verwerken locatie create POST
exports.locatie_create_post = [

    // Validate fields.
    body('naam').isLength({ min: 1 }).trim().withMessage('Naam van de locatie is verplicht.'),
    body('provincie').isLength({ min: 1 }).trim().withMessage('Naam van de provincie is verplicht.'),
    body('postcode').isLength({ min: 1 }).trim().withMessage('Postcode is vier cijfers lang.'),
    body('beschrijving').isLength({ min: 2 }).trim().withMessage('Beschrijving is verplicht.'),

    // Sanitize fields.
    sanitizeBody('naam').trim().escape(),
    sanitizeBody('provincie').trim().escape(),
    sanitizeBody('postcode').trim().escape(),
    sanitizeBody('beschrijving').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        // Extract the validation errors from a request.
        var errors = validationResult(req);

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
        
        // Create a Locatie object with escaped and trimmed data.
        var locatie = new Locatie(
            {
                naam: req.body.naam,
                provincie: req.body.provincie,
                postcode: req.body.postcode,
                beschrijving: req.body.beschrijving,
                afbeelding: afbeelding
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('locatie_form', { title: 'Toevoegen Locatie', locatie: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.

            // Check if Locatie with same name and postcode already exists.
            Locatie.findOne({ 'naam': req.body.naam, 'postcode': req.body.postcode })
                .exec(function (err, found_locatie) {
                    if (err) { return next(err); }

                    if (found_locatie) {
                        //Locatie bestaat al, doorsturen naar detailpagina
                        res.redirect(found_locatie.url);
                    }
                    else {
                        locatie.save(function (err) {
                            if (err) { return next(err); }
                            // Successful - redirect to new locatie record.
                            res.redirect(locatie.url);
                        });
                    }
                });
                    
           
           
        }
    }
];
       
// Weergeven locatie delete form bij GET
exports.locatie_delete_get = function (req, res, next) {
    async.parallel({
        locatie: function (callback) {
            Locatie
                .findById(req.params.id)
                .exec(callback)
        },
        locatie_spelers: function (callback) {
            Speler
                .find({ 'thuislocatie': req.params.id })
                .exec(callback)
        },
        locatie_sportfeesten: function (callback) {
            Sportfeest
                .find({ 'locatie': req.params.id })
                .exec(callback)
        }
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.locatie == null) {
            res.redirect('/menu/locaties');
        }
        res.render('locatie_delete', {
            title: 'Verwijder Locatie', locatie: results.locatie, locatie_spelers: results.locatie_spelers, locatie_sportfeesten: results.locatie_sportfeesten
        });


    });
};

// Verwerken locatie delete form bij POST
exports.locatie_delete_post = function (req, res, next) {

    async.parallel({
        locatie: function (callback) {
            Locatie
                .findById(req.body.locatieid)
                .populate('afbeelding')
                .exec(callback)
        },
        locatie_spelers: function (callback) {
            Speler.find({ 'thuislocatie': req.body.locatieid }).exec(callback)
        },
        locatie_sportfeesten: function (callback) {
            Sportfeest.find({ 'locatie': req.body.locatieid }).exec(callback)
        },
    }, function (err, results) {
        if (err) { return next(err); }
        if (results.locatie_spelers.length > 0 || results.locatie_sportfeesten.length>0) {
            res.render('locatie_delete', { title: 'Verwijder locatie', locatie: results.locatie, locatie_spelers: results.locatie_spelers, locatie_sportfeesten: results.locatie_sportfeesten })
        }
        else {
            
            // Verwijderen afbeelding van te verwijderen locatie
            if (results.locatie.afbeelding) {
                Afbeelding.findByIdAndRemove(results.locatie.afbeelding._id, function deleteAfbeelding(err) {
                    if (err) { return next(err); }
                });
            }
            // Verwijderen locatie
            Locatie.findByIdAndRemove(req.body.locatieid, function deleteLocatie(err) {
                if (err) { return next(err); } 
                res.redirect('/menu/locaties');
            });
        }
        
    });

};

// Weergeveven update form bij GET
exports.locatie_update_get = function (req, res, next) {
    Locatie
        .findById(req.params.id)
        .exec(function (err, locatie) {
            if (err) { return next(err); }
            if (locatie == null) { // No results.
                var err = new Error('Locatie not found');
                err.status = 404;
                return next(err);
            }
            else {
                res.render('locatie_form', { title: 'Wijzigen Locatie', locatie: locatie})
            }
        });
}

// Verwerken update form bij POST
exports.locatie_update_post = [
    
    // Validate fields.
    body('naam', 'Naam is verplicht.').isLength({ min: 1 }).trim(),
    body('provincie', 'Provincie is verplicht.').isLength({ min: 1 }).trim(),
    body('postcode', 'Postcode is verplicht.').isLength({ min: 1 }).trim(),
    body('beschrijving', 'Beschrijving is verplicht').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('naam').trim().escape(),
    sanitizeBody('provincie').trim().escape(),
    sanitizeBody('postcode').trim().escape(),
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
                Locatie
                    .findById(req.params.id)
                    .populate('afbeelding')
                    .exec(function (err, locatie) {
                        if (err) { return next(err); }
                        else {
                            if (locatie.afbeelding) {
                                Afbeelding.findByIdAndRemove(locatie.afbeelding._id, function deleteAfbeelding(err) {
                                    if (err) { return next(err); }
                                });
                            }
                        }
                    });   

            }
            else body('afbeelding').custom(value => { return Promise.reject('Het doorgestuurde bestand is geen geldige afbeelding') });
        }
        else {
            Locatie
                .findById(req.params.id)
                .populate('afbeelding')
                .exec(function (err, locatie) {
                    if (err) { return next(err); }
                    else {
                        afbeelding = locatie.afbeelding
                    }
                });    
        }   
        
        var locatie = new Locatie(
            {
                naam: req.body.naam,
                provincie: req.body.provincie,
                postcode: req.body.postcode,
                beschrijving: req.body.beschrijving,
                afbeelding: afbeelding,
                _id: req.params.id //This is required, or a new ID will be assigned!
            });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.
            res.render('locatie_form', { title: 'Wijzigen Locatie', locatie: locatie, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Locatie.findByIdAndUpdate(req.params.id, locatie, {}, function (err, delocatie) {
                if (err) { return next(err); }
                // Successful - redirect to locatie detail page.
                res.redirect(delocatie.url);
            });
        }
    }
];
