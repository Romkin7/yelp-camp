"use strict";
//estalish connection to mongoDB
require('./api/data/dbConnection');

//require all required packages
const express 		= require("express");
const bodyParser 	= require('body-parser');
const cookieParser 	= require('cookie-parser');
const session 		= require('express-session');
const mongoStore	= require('connect-mongo')(session);
const flash 		= require('express-flash');
const mongoose 		= require('mongoose');
const passport 		= require('passport');
const moment 		= require('moment');
const path 			= require('path');
const ejs 			= require('ejs');
const engine		= require('ejs-mate');

const Campground 	= require('./models/campground');
const User 			= require("./models/user");

//Routes
//const indexRoutes 	= require('./api/routes');
const authRoutes		= require('./api/routes/auth');
const profileRoutes 	= require('./api/routes/profile');
const campgroundRoutes 	= require('./api/routes/campground');

//initialize express app
const app = express();

/*Setup View engine*/
app.engine('ejs', engine);
app.set('view-engine', 'ejs');

//set port and ip
app.set("port", process.env.PORT || 3000);
app.set("ip", process.env.IP || "0.0.0.0");

//Set up static folders
app.use(express.static(path.join(__dirname + "/public")));

//Setup app packages and middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());

//Session setup
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false,
	store: new mongoStore({url: process.env.DATABASE, autoReconnect: true})
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Logging middleware
app.use(function(req, res, next) {
  console.log(req.method, req.url, req.body);
  next();
});

//Local variables
app.locals.moment = moment;
app.use(function(req, res, next) {
	res.locals.user = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

//Use routes
//app.use("/", indexRoutes);
app.use("/", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/campgrounds", campgroundRoutes);

//Start server
let server = app.listen(app.get("port"), app.get('ip'), (err) => {
	if(err) {
		console.error(err+" Couldn't start the server, because of technical issue.");
	} else {
		let port = server.address().port;
		console.log("YelpCamp app is running on port "+port);
	}
});
