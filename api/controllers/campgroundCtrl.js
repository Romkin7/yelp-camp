"use strict";
//Node and npm packages
const mongoose 		= require('mongoose');
const fs 			= require('fs');
const aws			= require('aws-sdk');
const multer 		= require('multer');
const multerS3 		= require('multer-s3');
//Schemas
const Campground 	= require('../../models/campground');
//Pagination module
const paginate 		= require('./paginate');

//Create new file-Upload System
aws.config.update({
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  	region: 'eu-west-1'
});

const s3 = new aws.S3();

const storage = multerS3({
	s3: s3,
	bucket: process.env.BUCKET_NAME,
	key: (req, file, cb) => {
		let fileExtension = file.originalname.split('.')[1];
		let path = "covers/"+req.user.username+Date.now()+'.'+fileExtension;
		cb(null, path);
	}
});

var upload = multer({storage: storage}).any("images", 3);

//Array splitterhelper
var _splitArray = (input) => {
	var output;
	if(input && input.length > 0) {
		output = input.split("!;");
	} else {
		output = [];
	}
	return output;
};

//Validate fileType
function validateFileType(req, res, next){
	//Setup filetype check
	const buffer = readChunk.sync(req.files[0].image, 0, 4100);
	fileType(buffer);
};

//Get all campgrounds
module.exports.getAllCampgrounds = (req, res, next) => {
	let foundUser = null;
	paginate.paginateCampgrounds(req, res, foundUser, next);
};

//Get post form
module.exports.getPostForm = (req, res, next) => {
	res.render("campground/new.ejs");
};

//Post new campground
module.exports.createCampground = (req, res, next) => {
	var campground = new Campground();
	campground.name = req.body.name;
	//campground.images = _splitArray(req.body.images);
	campground.street = req.body.location;
	campground.price = req.body.price;
	campground.description = req.body.description;
	campground.author = {
		id: req.user._id,
		username: req.user.username
	};
	campground.save((err, newCampground) => {
		if(err) {
			res.status(500).send(err.message);
		} else {
			req.flash("success", "Campground \""+newCampground.name+"\" has been created.");
			res.redirect("/api/campgrounds/"+newCampground._id);
		}
	});
};

module.exports.uploadCoverImage = (req, res, next) => {
	upload(req, res, (err)  => {
    	if(err) {
      		req.flash("error", err.message);
      		res.redirect("back");
     	 	return;
    	} else {
      		var file = "";
      		if(typeof req.file !== undefined) {
        	file = req.file.key;
        	console.log(file);
      	}
    }
  });
};

//Get one campground
module.exports.getCampground = (req, res, next) => {
	Campground.findById(req.params.id, (err, foundCampground) => {
		if(err) {
			req.flash("error", err.message);
			res.redirect("back");
			return;
		} else if(!foundCampground) {
			req.flash("error", "Couldn't find Campground.");
			res.redirect("back");
			return;
		} else {
			res.render("campground/show.ejs", {
				campground: foundCampground
			});
		}
	});
};