var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DisciplineSchema = new Schema(
    {
        naam: { type: String, required: true, max: 100 },
        beschrijving: { type: String, required: true, max: 100 },
    }
);

// Virtual voor url van de discipline
DisciplineSchema
    .virtual('url')
    .get(function () {
        return '/menu/discipline/' + this._id;
    });

// Export model
module.exports = mongoose.model('Discipline', DisciplineSchema);