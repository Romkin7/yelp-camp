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


/***** GRAB DATA FROM AJAX *****/
router.post('/data', function (req, res) {
  cropData = req.body.data;
});

/***** Upload Feature Image *****/
router.put('/posts/image/:id', upload.single('image'),middleware.checkPostOwnership , function (req, res) {
 var id = req.params.id;
 if(req.file) {
   var featuredImage = req.file.filename;
   const buffer = readChunk.sync(`./public/images/postFeaturedImage/${featuredImage}`, 0, 4100);
   if ((fileType(buffer) && fileType(buffer).mime === 'image/png') || (fileType(buffer) && fileType(buffer).mime === 'image/jpg') || (fileType(buffer) && fileType(buffer).mime === 'image/jpeg')) {

       Jimp.read(`./public/images/postFeaturedImage/${featuredImage}`, function (err, lenna) {
         if (err) throw err;
         if (lenna.bitmap.width > 800 && lenna.bitmap.height > 450 ) {
           var x = Number(cropData.x);
           var y = Number(cropData.y);
           var width = Number(cropData.width);
           var height = Number(cropData.height);
           lenna.crop( x, y, width, height ).quality(60).resize(1200, 675).write(`./public/images/postFeaturedImage/${featuredImage}`, function () {

             Jimp.read(`./public/images/postFeaturedImage/${featuredImage}`, function (err, lenna) {
               if (err) throw err;
               lenna.resize(240, 135).quality(60).write(`./public/images/postFeaturedImage/small-${featuredImage}`);
             });

           });


           Post.findById(id, function (err, post) {
             if (err) {
               req.flash('error', 'An error ocurred.');
               res.redirect('back');
             } else {
               if (post.featuredImage && post.featuredImage.length > 0) {

                 fs.unlink(`./public/images/postFeaturedImage/${post.featuredImage}`);
                 fs.unlink(`./public/images/postFeaturedImage/small-${post.featuredImage}`);

                 Post.findByIdAndUpdate(id, {featuredImage}, function () {});
                 req.flash('success', 'Post image uploaded succcessfully.');
                 res.redirect('back');
               } else {
                 Post.findByIdAndUpdate(id, {featuredImage}, function () {});
                 req.flash('success', 'Post image uploaded succcessfully.');
                 res.redirect('back');
               }
             }
           });

         } else {
           req.flash('error', 'Image should be at least 800 * 475 pxile.');
           res.redirect('back');