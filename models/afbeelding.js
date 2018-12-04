var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var AfbeeldingSchema = new Schema(
    {
        data: { type: Buffer, required: true },
        type: { type: String, rquired: true }
    }
);

// Virtual voor url van de afbeelding
AfbeeldingSchema
    .virtual('url')
    .get(function () {
        return '/menu/afbeelding/' + this._id;
    });

// Export model
module.exports = mongoose.model('Afbeelding', AfbeeldingSchema);