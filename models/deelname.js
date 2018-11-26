var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var DeelnameSchema = new Schema(
    {
        wedstrijd: { type: Schema.Types.ObjectId, ref: 'Wedstrijd', required: true },
        speler: { type: Schema.Types.ObjectId, ref: 'Speler', required: true },
        score: { type: Number, required: true },
    }
);

// Virtual voor url van de deelname
DeelnameSchema
    .virtual('url')
    .get(function () {
        return '/menu/deelname/' + this._id;
    });

// Export model
module.exports = mongoose.model('Deelname', DeelnameSchema);