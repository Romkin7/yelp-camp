"use strict";
//Node and npm packages
const mongoose 		= require('mongoose');
const fs 			= require('fs');
const aws			= require('aws-sdk');
const fileType 		= require('file-type');
const readChunk		= require('read-chunk');
const jimp			= require('jimp');
const multer 		= require('multer');
const streamingS3	= require('streaming-s3');
//Schemas
const Campground 	= require('../../models/campground');
//Pagination module
const paginate 		= require('./paginate');

//Variables to store upload image data
let cropperData;
let featuredImg;
let featuredMinImg;
let awsResponse;
let stats;

//Create new file-Upload System
var storage =   multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './public/images/uploads');
  },
  filename: function (req, file, callback) {
  	var fileExtension = file.originalname.split('.')[1];
  	featuredImg = req.user.username+Date.now()+'.'+fileExtension;
    callback(null, featuredImg);
  }
});
var upload = multer({ storage : storage}).single('image');

//configure aws flieStream
function streamToS3Aws(req, res, next) {
	var fStream = fs.createReadStream('./public/images/cropped-images/'+featuredMinImg);
	var streamToS3 = new streamingS3(fStream,{accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, region: 'eu-west-1'}, {
		Bucket: process.env.BUCKET_NAME,
		Key: featuredMinImg,
		ContentType: "image/jpg" || "image/png" || "image/jpeg" || "image/bmp"
	}, (err, response, stats) => {
		if(err) {
			req.flash("error", "Error while uploaading image to S3 cloud.");
			res.redirect("back");	
			return;
		} else {
			var campground = new Campground();
			campground.name = req.body.name;
			//campground.images = response.Location;
			campground.street = req.body.location;
			campground.cover = response.Location;
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
					return;
				}
			});
		}
	});
};

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
module.exports.getCropperData = (req, res, next) => {
	/***** GRAB DATA FROM AJAX *****/
	cropperData = req.body;
	console.log(cropperData);
	if(cropperData !== undefined) {
		res.send('success');
	} else {
		res.send("error");
	}
};

module.exports.createCampground = (req, res, next) => {
	upload(req, res, (err) => {
		if(err) {
			req.flash("error", err.message);
			res.redirect('back');
			return;
		} else {
			if(req.file) {
				const buffer = readChunk.sync(`./public/images/uploads/${featuredImg}`, 0, 4100);
				if ((fileType(buffer) && fileType(buffer).mime === 'image/png') || (fileType(buffer) && fileType(buffer).mime === 'image/jpg') || (fileType(buffer) && fileType(buffer).mime === 'image/jpeg')) {
					jimp.read(`./public/images/uploads/${featuredImg}`, (err, lenna) => {
						if(err) {
							req.flash("error", err.message);
							res.redirect('back');
							return;
						} else {
							if(lenna.bitmap.width > 800 && lenna.bitmap.height > 450) {
								var x = Number(cropperData.x);
								var y = Number(cropperData.y);
								var width = Number(cropperData.width);
								var height = Number(cropperData.height);
								var rotate = Number(cropperData.rotate);
								var scaleX = Number(cropperData.scaleX);
								var scaleY = Number(cropperData.scaleY);
								lenna.rotate(rotate).scale(scaleX).crop(x, y, width, height).quality(60)
								.resize(1200, 675).write(`./public/images/cropped-images/${featuredImg}`, (err, croppedImg) => {
									if(err) {
										req.flash("error", err.message);
										res.redirect('back');
										return;
									} else {
										featuredMinImg = featuredImg;
										streamToS3Aws(req, res, next);	
									}
								}); 
							}
						}
					});
				}
			} else {
				req.flash("error", "No image found to upload.");
				res.redirect("back");
			}
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