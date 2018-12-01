var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var LocatieSchema = new Schema(
    {
        naam: { type: String, required: true, max: 100 },
        provincie: { type: String, required: true, max: 100 },
        postcode: { type: Number, required: true },
        beschrijving: { type: String, required: true, max: 200 },
        afbeelding: { type: Schema.Types.ObjectId, ref:'Afbeelding', required: false}
    }
);

// Virtual voor url van de locatie
LocatieSchema
    .virtual('url')
    .get(function () {
        return '/menu/locatie/' + this._id;
    });

// Virtual voor url van de provincie
LocatieSchema
    .virtual('provincie_url')
    .get(function () {
        return '/menu/provincie/' + this.provincie;
    });


// Export model
module.exports = mongoose.model('Locatie', LocatieSchema);