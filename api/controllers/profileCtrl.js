"use strict";
const mongoose = require('mongoose');

const paginate = require('./paginate');

const User = require('../../models/user');

//get profile
module.exports.getProfile = (req, res, next) => {
	User.findById(req.user.id, (err, foundUser) => {
		if(err) {
			req.flash("error", err.message);
			res.redirect('back');
			return;
		} else if(!foundUser) {
			req.flash('error', "User was not found.");
			return;
		} else {
			paginate.paginateUserCampgrounds(req, res, next);
		}
	});
};

// post to profile
module.exports.uploadAvatar = (req, res, next) => {

};