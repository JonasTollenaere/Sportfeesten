var Locatie = require('../models/locatie');
var async = require('async');

// Specifieke provincie weergeven
exports.provincie_detail = function (req, res, next) {
    async.parallel({
        locatie_list: function (callback) {
            Locatie.find({ provincie: req.params.provincienaam })
                .exec(callback);
        },

    }, function (err, results) {
        if (err) { return next(err); }
        if (results.locatie_list == null) { // No results.
            var err = new Error('Locatie niet gevonden');
            err.status = 404;
            return next(err);
        }
        // Successful, so render
        res.render('provincie_detail', { title: 'Provincie Details', locatie_list: results.locatie_list, provincienaam: req.params.provincienaam });
    });
};

/// NOG IMPLEMENTEREN LATER: locatie_create_get, locatie_delete_get, locatie_delete_post, locatie_update_get, locatie_update_post

