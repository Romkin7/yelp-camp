"use strict";
const mongoose = require('mongoose');
const User = require('../../models/user');

const sendMail = require('./sendMail');

//Login logic
//Get login form
module.exports.getLoginForm = (req, res, next) => {
	res.render("auth/login.ejs");
};

//Register logic
//get register form
module.exports.getRegisterForm = (req, res, next) => {
	res.render("auth/register.ejs");
};

//register a user
module.exports.register = (req, res, next) => {
	var user = new User();
	user.name.firstname = req.body.name;
	user.name.lastname = req.body.lastname;
	user.email = req.body.email;
	user.username = req.body.username;
	user.password = req.body.password;
	user.created = Date.now();
	user.save((err, newUser) => {
		if(err) {
			res.send("error");
			return;
		} else {
			//sendMail.welcome(req, res, user, next);
			res.send("success");
		}
	});
};

//compare username and email
module.exports.compareUname = (req, res, next) => {
	if(req.body.username) {
		User.findOne({username: req.body.username}, (err, user) => {
			if(err) {
				res.send(err.message);
				return;
			} if(!user) {
				res.send("success");
				return;
			} else {
				res.send("taken");
			}
		});
	} else {
		return false;
	}
};

module.exports.compareEmail = (req, res, next) => {
	if(req.body.email) {
		User.findOne({email: req.body.email}, (err, user) => {
			if(err) {
				res.send(err.message);
				return;
			} if(!user) {
				res.send("success");
				return;
			} else {
				res.send("taken");
			}
		});
	} else {
		return false;
	}
};

//Logout logic
module.exports.logOut = (req, res, next) => {
	req.logout();
	req.flash("success", "Goodbye, Welcome back again!");
	res.redirect("/api/campgrounds");
};
