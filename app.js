var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const session = require('express-session');
var nodemailer = require('nodemailer');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '297013651062-1shj4bgq9l26bjdt67m3qfdtkqe6ojt7.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
var app = express();

/**
 * 
 * Use react datatable
 * build crud with react and node no redux
 */

var transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "40dac0f48a9ab3",
    pass: "eba5c92c1069e4"
  }
});

var mailOptions = {
  from: '"Example Team" <from@example.com>',
  to: 'user1@example.com, user2@example.com',
  subject: 'Nice Nodemailer test',
  text: 'Hey there, its our first message sent with Nodemailer ;) ',
  html: '<b>Hey there! </b><br> This is our first message sent with Nodemailer'
};

transport.sendMail(mailOptions, (error, info) => {
  if (error) {
      return console.log(error);
  }
  console.log('Message sent: %s', info.messageId);
});

var userProfile;

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET'
}));

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.get('/success', (req, res) => res.send(userProfile));
app.get('/error', (req, res) => res.send('error logging in'));
app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
  
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    res.redirect('/success');
  });


passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
    userProfile=profile;
    return done(null, userProfile);
}
));

passport.serializeUser( function(user, cb){
  cb(null, user)
});
passport.deserializeUser(function(obj, cb){
  cb(null, obj)
})


// catch 404 and forward to error handler
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
