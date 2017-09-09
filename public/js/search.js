// On search form submission run db query.
//Select all elements
"use strict";
//form elements
var searchForm = document.getElementById('searchForm');
var searchInput = document.querySelector('#Search');
var searchBtn = document.getElementById('searchBtn');
//error and success messages
var errorMsg = document.querySelector("#errorMsg");
var successMsg = document.querySelector("#successMsg");
//Page grid
var campgroundGrid = document.querySelector(".grid");

//Get input value and send ajax request to handle db query
$(searchForm).on("submit", function(event) {
	event.preventDefault();
	$(searchBtn).prop("disabled", true);
	var name = $(searchInput).val();
	if(!name || name.length < 2) {
		$(searchInput).addClass("has-error");
		$(errorMsg).html("<p>Hakusanan pitää olla vähintään 2 merkkiä pitkä!</p>");
		$(searchBtn).prop("disabled", false);
	} else {
		$.get("/api/campgrounds?search="+name, function(response) {
			if(response === "error") {
				$(errorMsg).html()
				$(searchInput).val("");
				$(searchBtn).prop("disabled", false);
			} else {
				$(campgroundGrid).html("");
				$(searchInput).val("");
				$(searchBtn).prop("disabled", false);
				response.campgrounds.forEach(function(campground) {
					$(campgroundGrid).append(`
						<div class="col-md-4 col-sm-4 col-xs-6 grid-item rig-cell">
						<img class="rig-img" src="${campground.cover}">
						<h4 class="rig-header">${campground.name}</h4>
						<p class="rig-text">${campground.price} €/day</p>
						<a class="rig-icon" href="/api/campgrounds/${campground._id}"><i class="fa fa-plus" aria-hidden="true"></i></a>
						<div class="rig-overlay"></div>
					</div>
					`)
				});
			}
		})
	}
})