var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var session= require('express-session');
var passport = require('passport');
var DBconfig = require('./config/database.js');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));//path:處理linux 與 windows 路徑不同問題(/,\)
app.set('view engine', 'ejs');

//connect db
mongoose.connect(DBconfig.url); 


require('./config/passport')(passport); // pass passport for configuration
app.use(logger('dev')); // log every request to the console
app.use(bodyParser());  //處理POST的body能力
app.use(bodyParser.urlencoded({ extended: false  }));//設定支援application/x-www-form-urlencoded,但不在bodyparse處理querystring
app.use(cookieParser());//cookie
app.use(express.static(path.join(__dirname, 'public')));//path:處理linux 與 windows 路徑不同問題(/,\)
app.use(session({ secret: 'youcanplaceanythingfillinthisfiled' }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

require('./routes/')(app,passport);//router

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
// error handlers
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
var port = process.env.PORT || '3000';
app.listen(port);
console.log('The server is create on port ' + port);
//module.exports = app;
