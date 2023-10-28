const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const { isLoggedIn, isOwner } = require("../middleware.js");
const listingController = require("../controllers/listing");

//image upload
const multer  = require('multer');
const {storage} =require("../cloudConfig");
const upload = multer({ storage });


router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,upload.single('listing[image]'), wrapAsync(listingController.createListing));


//search route
router.post("/search",listingController.search);


// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get( wrapAsync(listingController.showListings))
.put(isLoggedIn,upload.single('listing[image]'), isOwner, wrapAsync(listingController.updateListing))
.delete( isLoggedIn, isOwner, wrapAsync(listingController.destroy));

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;