"use strict";
const express = require('express');
const router = express.Router();
const passport = require('passport');

const authCtrl = require('../controllers/authCtrl');
const passportConf = require('../config/passport');

router
	.route('/login')
	.get(authCtrl.getLoginForm)
	.post(passport.authenticate('local', {
  		successRedirect: '/api/profile',
  		failureRedirect: '/login',
  		failureFlash: true
	}));

router
	.route("/signup")
	.get(authCtrl.getRegisterForm)
	.post(authCtrl.register);

router
	.route('/compareuname')
	.post(authCtrl.compareUname);

router
	.route('/compareemail')
	.post(authCtrl.compareEmail);

router
	.route('/logout')
	.get(authCtrl.logOut);

module.exports = router;