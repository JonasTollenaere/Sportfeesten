var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var WedstrijdSchema = new Schema(
    {
        discipline: { type: Schema.Types.ObjectId, ref: 'Discipline', required: true },
        sportfeest: { type: Schema.Types.ObjectId, ref: 'Sportfeest', required: true },
    }
);

// Virtual voor url van de wedstrijd
WedstrijdSchema
    .virtual('url')
    .get(function () {
        return '/menu/wedstrijd/' + this._id;
    });

// Export model
module.exports = mongoose.model('Wedstrijd', WedstrijdSchema);