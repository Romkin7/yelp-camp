"use strict";
const sgMail = require('@sendgrid/mail');

//Initialize sgMail

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//Email messages
module.exports.welcome = (req, res, user, next) => {
	const email = {
		to: user.email,
		from: process.env.COMPANY+' '+process.env.EMAIL,
		subject: "Welcome to YelpCamp",
		text: "Dear "+user.name.firstname+ ' '+user.name.lastname+", welcome to YelpCamp."
	};
	sgMail.send(email).then(() => {
		next();
	}).catch(() => {
		req.flash("error", "something went wrong.");
		res.redirect('back');
		return;
	});
};