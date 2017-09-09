"use strict";
const Campground = require('../../models/campground');
const User = require('../../models/user');

//Configure authentication object 
let authObj = {};

// define methods that are attached to authentication object
// Verify campground ownership
authObj.verifyCampgroundOwnership = (req, res, next) => {
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, (err, foundCampground) => {
			if(err) {
				req.flash("error", err.message);
				res.redirect('back');
				return;
			} else if(!foundCampground) {
				req.flash("error", "Couldn't find campground.");
				res.redirect("back");
				return;
			} else {
				if(foundCampground.owner._id.equals(req.user._id)) {
					next();
				} else {
					req.flash("error", "You don't have premission to do this.");
					res.redirect("back");
				}
			}
		});
	} else {
		req.flash("error", "Only author can preform this action.");
		res.redirect("back");
	}
};
//Verify comment ownership
authObj.verifyCommentOwnership = (req, res, next) => {

};
// Exisisting Rating verification
authObj.exisistingRatingVerification = (req, res, next) => {

};
//Logged in status verification
authObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Only signed in users have premission to view profile and create or rate campgrounds.");
    res.redirect("/login");
}
authObj.loggedInStatus = function(req, res, next) {
	User.findById(req.user.id, function(err, foundUser) {
		if(foundUser.status === false) {
			foundUser.status = true;
		} else {
		foundUser.status = false;
	}
	next();
	});
};

module.exports = authObj;
