"use strict";
//Require passport packages
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = require('../../models/user');

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((id, done) => {
	User.findById(id, (err, user) => {
		done(err, user);
	});
});

passport.use("local", new localStrategy({
	usernameField: "username",
  passwordField: "password",
  passReqToCallback: true
},
function(req, username, password, done) {
	User.findOne({username: username}, function(err, user) {
    if(err) {
      return done(null, false, {
        message: err.message
      });
    } if(!user) {
      return done(null, false, {
        message: "käyttäjää ei löytynyt!"
      });
    } if(!user.comparePassword(password)) {
      return done(null, false, {
        message: "Väärä salasana!"
      });
    } else {
      return done(null, user, req.flash("success", user.username+" welcome back to YelpCamp."));
    }
  });
}));