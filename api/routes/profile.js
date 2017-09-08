"use strict";
const express = require('express');
const router = express.Router();

const authObj = require('../config/authObj');
const profileCtrl = require('../controllers/profileCtrl');

// "/" routes
router
	.route("/")
	.get(authObj.isLoggedIn, profileCtrl.getProfile)
	.post(authObj.isLoggedIn, profileCtrl.uploadAvatar);

module.exports = router;