var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var GebruikerSchema = new Schema(
    {
        username: { type: String, required: true, max:100, unique: true},
        password: { type: String, required: true, max: 100 }
    }
);

GebruikerSchema.plugin(passportLocalMongoose)

// Virtual voor url van de gebruiker
GebruikerSchema
    .virtual('url')
    .get(function () {
        return '/menu/user/' + this._id;
    });

// Export model
module.exports = mongoose.model('Gebruiker', GebruikerSchema);