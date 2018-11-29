var mongoose = require('mongoose');
var moment = require('moment');


var Schema = mongoose.Schema;

var SpelerSchema = new Schema(
    {
       // speler_id: Schema.Types.ObjectId,
        voornaam: { type: String, required: true, max:100},
        achternaam: { type: String, required: true, max: 100 },
        geboortedatum: { type: Date, required: true },
        thuislocatie: { type: Schema.Types.ObjectId, ref: 'Locatie', required: true },
    }
);

// Virtual voor volledige naam van de speler
SpelerSchema
    .virtual('volledige_naam')
    .get(function () {
        return this.achternaam + ", " + this.voornaam;
    });

// Virtual voor url van de speler
SpelerSchema
    .virtual('url')
    .get(function () {
        return '/menu/speler/' + this._id;
    });

// Virtual voor de geformatteerde geboortedatum
SpelerSchema
    .virtual('geboortedatum_geformatteerd')
    .get(function () {
        return moment(this.geboortedatum).format('l');
    });

// Virtual voor geboortedatum in form
SpelerSchema
    .virtual('geboortedatum_form')
    .get(function () {
        return moment(this.geboortedatum).format('YYYY-MM-DD');
    });

// Virtual voor leeftijd
SpelerSchema
    .virtual('leeftijd')
    .get(function () {
        return moment().diff(moment(this.geboortedatum), 'years');
    });


// Export model
module.exports = mongoose.model('Speler', SpelerSchema);