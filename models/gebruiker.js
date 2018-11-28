var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');
var Schema = mongoose.Schema;

var GebruikerSchema = new Schema(
    {
        username: { type: String },
        password: { type: String }
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