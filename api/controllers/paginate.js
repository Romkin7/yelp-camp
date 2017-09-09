"use strict";
const Campground   = require('../../models/campground');

let perPage = 8;
let page = 1;
let value = -1;
let output = {
  data: null,
  pages: {
    current: page,
    prev: 0,
    hasPrev: false,
    next: 0,
    hasNext: false,
    total: 0
  },
  items: {
    begin: ((page * perPage) - perPage) + 1,
    end: page * perPage,
    total: 0
  }
};

function init(req, res, next) {
  if (req.query && req.query.perPage) {
    perPage = parseInt(req.query.perPage, 10);
  }
  if (req.query && req.query.page) {
    page = parseInt(req.query.page, 10);
  }
  if (req.query && req.query.value) {
    value = parseInt(req.query.value, 10);
  }
}

function setOutput(campgrounds, count) {
  output.items.total = count;
  output.data = campgrounds;
  output.pages.total = Math.ceil(output.items.total / perPage);
  output.pages.current = page;
  if(output.pages.current < output.pages.total) {
    output.pages.next = Number(output.pages.current) + 1;
  } else {
    output.pages.next = 0;
  }
  output.pages.hasNext = (output.pages.next !== 0);
  output.pages.prev = output.pages.current - 1;
  output.pages.hasPrev = (output.pages.prev !== 0);
  if (output.items.end > output.items.total) {
    output.items.end = output.items.total;
  }
};

module.exports.paginateCampgrounds = function(req, res, next) {
  init(req, res);
  if(req.query && req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Campground
    .find().where("name").equals(req.query.search)
    .skip((page - 1) * perPage)
    .limit(perPage)
    .sort({"created": value}).exec(function(err, campgrounds) {
      if(err) {
        return res.status(500).json({"error": err.message});
      }
      if(!campgrounds) {
        req.flash("error", "Valitettavasti antamallasi hakusanalla "+regex+", ei löytynyt yhtään tulosta.");
        res.redirect('back');
        return;
      } else {
        Campground.count().where("name").equals(req.query.search)
        .exec(function(err, count) {
          if(err) return res.status(500).json(err);
          setOutput(campgrounds, count);
          res.status(200).json({
            campgrounds: output.data,
            pages: output.pages,
            items: output.items
          });
        });
      }
    });
    return;
  } else {
    Campground
    .find()
    .sort({"created": value})
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec(function(err, campgrounds) {
      if(err) return next(err);
      Campground.count().exec(function(err, count) {
        if(err) return res.status(500).json(err);
        setOutput(campgrounds, count);
        res.render("campground/index.ejs", {
          campgrounds: output.data,
          pages: output.pages,
          items: output.items
        });
      });
    });
  }
};

//Paginate users campgrounds
module.exports.paginateUserCampgrounds = (req, res, next) => {
  Campground
    .find()
    .where('author.id').equals(req.user.id)
    .sort({"created": value})
    .skip((page - 1) * perPage)
    .limit(perPage)
    .exec(function(err, campgrounds) {
      if(err) return next(err);
      Campground.count()
      .where('author.id').equals(req.user.id)
      .exec(function(err, count) {
        if(err) return res.status(500).json(err);
        setOutput(campgrounds, count);
        res.render("profile/profile.ejs", {
          campgrounds: output.data,
          pages: output.pages,
          items: output.items
        });
      });
    });
};

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
