$(document).ready(function() {
  var _URL = window.URL || window.webkitURL;
  //Dom element variables
  var imgPreview = $("#imgPreview");
  var errorMsg = $("#errorMsgUpload");
  var imageBtns = $("#imageBtns");
  var pickImage = $("#coverImgLabel");
  var postForm = $("#postForm");
  //Campground variables
  var coverImage;
  var campground = {
    name: "",
    price: null,
    location: "",
    description: ""
  };
  //Initial setup
  pickImage.prop("disabled", false);
  imageBtns.hide();
  //On image select function
  $("#postForm").on("change", "#campgroundImgUpload", function(event) {
    if(sizeValid(this, 3000000) && typeValid('campgroundImgUpload')) {
      errorMsg.html("");
      var reader = new FileReader();
      reader.onload = function(event) {
        document.getElementById("imgPreview").src = event.target.result;
        $("#imgPreview")
          .on("load", function() {
            errorMsg.html('');
            cropImage(4/3, 650, 406);
            pickImage.hide();
            imageBtns.show();
          })
          .on("error", function() {
            imgPreview.src = '';
            reset();
            errorMsg.html("An error occurred displaying your image.");
          });
      };
      reader.readAsDataURL(this.files[0]);
    }
    heightAndWidthValid(this, 650, 406);
  });
  //Submit image
  $("#submitImage").on("click", function(event) {
    event.preventDefault();
    coverImage = $("#imgPreview").cropper("getData", true);
    $('#imgPreview').cropper('destroy');
    $("#imgPreview").removeAttr("src");
    imageBtns.hide();
    pickImage.show();
    pickImage.prop("disabled", true);
    console.log(coverImage);
  });
  /* *** WHEN CLICK ON RESET *** */
  $('#resetImage').on('click', function () {
    reset();
  });
  //Crop function
  function cropImage(aspect, minW, minH) {
    $('#imgPreview').cropper({
      aspectRatio: aspect,
      viewMode: 1,
      background: false,
      modal: false,
      zoomable: true,
      minCropBoxWidth: minW,
      minCropBoxHeight: minH,
      ready: function () {
      }
    });
  };

  //Function to reset cropper data
  function reset() {
    errorMsg.html("");
    $('#imgPreview').cropper('destroy');
    $("#imgPreview").removeAttr("src");
    pickImage.show();
    pickImage.prop("disabled", false);
    imageBtns.hide();
  };

  //Validation functions
  //Validate file size
  function sizeValid(self, size) {
    if(self.files[0].size > size) {
      reset();
      errorMsg.html("Image has to be less than 3MB.");
      return false;
    } else {
      return true;
    }
  };
  //Validate file type
  function typeValid(id) {
    var id = id;
    var type = document.getElementById(id).files[0].type;
    type = type.toString();
    if(type !== "image/jpg" && type !== "image/png" && type !== "image/jpeg") {
      reset();
      errorMsg.html("Only jpg, png or jpeg image types are allowed.");
      return false;
    } else {
      return true;
    }
  };
  //Validate image height and width
  function heightAndWidthValid(self, width, height) {
    var file,
        img;

    if((file = self.files[0])) {
      img = new Image();
      img.onload = function() {
        if(this.width < width || this.height < height) {
          errorMsg.html("Images size can't be less than, "+ width+ "*"+ height+ "pixels.");
          $('#imagePreview').cropper('destroy');
          $("#imagePreview").removeAttr("src");
        }
      };
      img.src = _URL.createObjectURL(file);
    }
  };
  //Validate inputs
  function validateInputs() {
    //value variables
    var nameVal = $("#title").val();
    var descriptionVal = $("#description").val();
    var priceVal = $("#price").val();
    var locationVal = $("#location").val();
    //Validation functions invocation
    validateName(nameVal);
    validateDescription(descriptionVal);
    validatePrice(priceVal);
    validateLocation(locationVal);
    //Functions that will validate fields
    //Name input
    function validateName(nameVal) {
      if(nameVal === "") {
        $("#title").addClass("invalid");
        campground.name = "";
      } else if(nameVal.length < 3) {
        $("#title").addClass("invalid");
        campground.name = "";
      } else {
        $("#title").addClass("valid");
        campground.name = nameVal;
      }
    };
    //Description input
    function validateDescription(descriptionVal) {
      if(descriptionVal === "") {
        $("#description").addClass("invalid");
        campground.description = "";
      } else if(descriptionVal.length < 5) {
        $("#description").addClass("invalid");
        campground.description = "";
      } else {
        $("#description").addClass("valid");
        campground.description = descriptionVal;
      }
    };
    //Price input
    function validatePrice(priceVal) {
      if(priceVal === null) {
        $("#price").addClass("invalid");
        campground.price = null;
      } else {
        $("#price").addClass("valid");
        campground.price = priceVal;
      }
    };
    //Location input
    function validateLocation(locationVal) {
      if(locationVal === "") {
        $("#location").addClass("invalid");
        campground.location = "";
      } else {
        $("#location").addClass("valid");
        campground.location = locationVal;
      }
    };
  };
  //Submit form
  postForm.on("submit", function(event) {
    event.preventDefault();
    validateInputs();
    console.log(coverImage);
    if(coverImage !== null && campground.name !== "" && campground.description !== "" && campground.location !== "" && campground.price !== null) {
      $.ajax({
        type: "POST",
        data: {
          campground: campground,
          file: coverImage
        },
        success: function(data) {
          console.log('Success!')
        },
        error: function(jqXHR, textStatus, err) {
          console.log('text status '+textStatus+', err '+err)
        }
      });
    }
  });
});