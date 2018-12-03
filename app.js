var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var passport = require('passport');
var session = require('express-session');
var fileupload = require('express-fileupload');


var indexRouter = require('./routes/index');
var menuRouter = require('./routes/menu');
var userRouter = require('./routes/user')

var app = express();

// MongoDB setup - set up mongoose connection
var mongoose = require('mongoose');
var mongoDB = process.env.MONGODB_URI || 'mongodb://sportfeestsite:ML4BJS@ds249372.mlab.com:49372/sportfeest';
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(fileupload());

// Passport and middleware setup
app.use(session({ secret: 'RFJ2hGclIgRjPYjhvrB2', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


// Routing setup
app.use('/', indexRouter);
app.use('/menu', menuRouter);
app.use('/user', userRouter);

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
