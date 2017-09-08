'use strict';
const express = require('express');
const router = express.Router();

const authObj = require('../config/authObj');
const campgroundCtrl = require('../controllers/campgroundCtrl');

// "/campground"
router
	.route("/")
	.get(campgroundCtrl.getAllCampgrounds)
	.post(campgroundCtrl.createCampground);

router
	.route("/new")
	.get(authObj.isLoggedIn, campgroundCtrl.getPostForm);

router
	.route("/:id")
	.get(campgroundCtrl.getCampground);

module.exports = router;
