var passport = require('passport');
var Gebruiker = require('../models/gebruiker');
var LocalStrategy = require('passport-local').Strategy;

/*
// Passport local strategy
passport.use(new LocalStrategy(
    function (username, password, done) {
        Gebruiker.findOne({ username: username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrecte gebruikersnaam.' });
            }
            if (!user.validPassword(password)) {
                return done(null, false, { message: 'Incorrect paswoord.' });
            }
            return done(null, user);
        });
    }
));
*/

// ---
passport.use(new LocalStrategy(Gebruiker.authenticate()));
//passport.serializeUser(Account.serializeUser());
//passport.deserializeUser(Account.deserializeUser());



/// USER ROUTES
// Login weergeven
exports.login_get = function (req, res) {
    res.render('login_form', {title: 'Aanmelden als administrator', user: req.user});
};

exports.login_post = [
    passport.authenticate('local', { failureRedirect: '/user/login' }),
    function (req, res) {
        res.redirect('/');
    }
]

exports.logout_get = function (req, res) {
    res.logout();
    res.redirect('/')
};