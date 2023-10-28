const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync");
const {isLoggedIn, isReviewAuthor, validateReview} = require("../middleware");
const reviewController = require("../controllers/review");

// Reviews Post Route
router.post("/",isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

// Reviews Delete Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroy));

module.exports = router;