"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
	follower: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	followed: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	campground: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campground"
	},
	isFolowed: {type: Boolean, default: false},
	isRead: {type: Boolean, default: false},
	isUpdated: {type: Boolean, default: false}
});

module.exports = mongoose.model('Notification', notificationSchema);