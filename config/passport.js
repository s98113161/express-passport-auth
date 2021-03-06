// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
// load up the user model
var User= require('../models/user.js');
// load the auth variables
var configAuth = require('./auth');
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
      console.log(user); 
        done(null, user.id); //其實是在資料庫內的object.id
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with account
        usernameField : 'account',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, account, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose account is the same as the forms account
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.account' :  account }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that account
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That account is already taken.'));
            } else {

                // if there is no user with that account
                // create the user
                var newUser  = new User();

                // set the user's local credentials
                newUser.local.account    = account;
                newUser.local.password = newUser.generateHash(password);

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

    });

    }));

	// =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with account
        usernameField : 'account',
        passwordField : 'password',
        passReqToCallback : true, // allows us to pass back the entire request to the callback

    },
    function(req, account, password, done) { // callback with account and password from our form

        // find a user whose account is the same as the forms account
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.account' :  account }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));
    passport.use(new FacebookStrategy({

        // pull in our app id and secret from our auth.js file
        clientID         : configAuth.facebookAuth.clientID,
        clientSecret     : configAuth.facebookAuth.clientSecret,
        callbackURL      : configAuth.facebookAuth.callbackURL,
        profileFields	 : [ 'email' , 'name' ],
        passReqToCallback: true
    },

    // facebook will send back the token and profile
    function(req,token, refreshToken, profile, done) {
        // asynchronous
        process.nextTick(function() {

            // find the user in the database based on their facebook id
            User.findOne({ 'facebook.facebookid' : profile.id }, function(err, user) {

                // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found, then log them in
                if (user) {
                    if(req.session.deviceid){
                        User.update({_id:user._id},{$push:{"facebook.deviceid":req.session.deviceid}},function(err,updateUser){
                            if(err){
                            return done(err); //if error, stop that and return
                        }
                    })
                    }
                    delete req.session.deviceid; //success,and delete session.deviceid
                    return done(null, user);// find user || update sucess , return that user
                  //  return done(null, user); // user found, return that user
              } else {
                    // if there is no user found with that facebook id, create them
                    var newUser            = new User();
                    //將Session.deviceid寫入到資料庫。
                    newUser.facebook.deviceid    = req.session.deviceid;
                    // set all of the facebook information in our user model
                    newUser.facebook.facebookid  = profile.id; // set the users facebook id                   
                    newUser.facebook.token       = token; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name        = profile.name.givenName + ' ' + profile.name.familyName; // look at the passport user profile to see how names are returned
                    newUser.facebook.email       = profile.emails[0].value; // facebook can return multiple emails so we'll take the first

                    // save our user to the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        // if successful, return the new user
                        // 並刪除session.deviceid
                        delete req.session.deviceid;
                        return done(null, newUser);
                    });
                }

            });
        });

    }));
};
