var passport = require('passport');
var Gebruiker = require('../models/gebruiker');
var LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(Gebruiker.authenticate()));
passport.serializeUser(Gebruiker.serializeUser());
passport.deserializeUser(Gebruiker.deserializeUser());



/// USER ROUTES
// Login form weergeven
exports.login_get = function (req, res) {
    res.render('login_form', {title: 'Aanmelden als administrator'});
};

// Login post verwerken
exports.login_post = [
    passport.authenticate('local', { failureRedirect: '/user/login' }),
    function (req, res) {
        res.redirect('/');
    }
]

// Logout verwerken
exports.logout_get = function (req, res) {
    req.logout();
    res.redirect('/')
};

// Opgevraagde gebruikerinfo opsturen
exports.get_gebruiker_info = function (req, res) {
    res.send(req.session.passport.user);
}

