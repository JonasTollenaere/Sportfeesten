var Afbeelding = require('../models/afbeelding');

// teruggeven afbeelding bij afbeelding GET
exports.afbeelding_get = function (req, res, next) {
    Afbeelding
        .findById(req.params.id)
        .exec(function (err, afbeelding) {
            if (err) { return next(err); }
            if (afbeelding == null) { // Geen resultaten
                var err = new Error('Afbeelding niet gevonden');
                err.status = 404;
                return next(err);
            }
            else {
                res.send(afbeelding.data);
            }
        });
}

// weergeven afbeelding bij afbeelding GET detail
exports.afbeelding_detail = function (req, res, next) {
    Afbeelding
        .findById(req.params.id)
        .exec(function (err, afbeelding) {
            if (err) { return next(err); }
            if (afbeelding == null) { // Geen resultaten
                var err = new Error('Afbeelding niet gevonden');
                err.status = 404;
                return next(err);
            }
            else {
                res.render('afbeelding_detail', { afbeeldingid: req.params.id });
            }
        });
}