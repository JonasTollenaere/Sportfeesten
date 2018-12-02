var mongoose = require('mongoose');
var moment = require('moment');

var Schema = mongoose.Schema;

var SportfeestSchema = new Schema(
    {
        locatie: { type: Schema.Types.ObjectId, ref: 'Locatie', required: true },
        datum: { type: Date, required: true },
    }
);

// Virtual voor url van de wedstrijd
SportfeestSchema
    .virtual('url')
    .get(function () {
        return '/menu/sportfeest/' + this._id;
    });

// Virtual voor de geformatteerde datum
SportfeestSchema
    .virtual('datum_geformatteerd')
    .get(function () {
        return moment(this.datum).format('YYYY-MM-DD');
    });


// Virtual formaat voor de datum voor in te vullen in form
SportfeestSchema
    .virtual('datum_form')
    .get(function () {
        return moment(this.datum).format('YYYY-MM-DD');
    });

// Export model
module.exports = mongoose.model('Sportfeest', SportfeestSchema);