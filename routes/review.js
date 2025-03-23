const express = require("express");
const router = express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js"); // require wrap async
const ExpressError = require("../utils/ExpressError.js"); // express error
const Review = require("../models/review.js"); // require review from show.ejs
const Listing = require("../models/listing.js");
const {validateReview, isLoggedin,isReviewAuthor} = require("../middleware.js");

const reviewController = require("../controllers/reviews.js");
const review = require("../models/review.js");


//after the restucturing of app.get in listing.js
//app.use("/listings", listings);

//          review route for all listings from
router.post("/",isLoggedin, validateReview, wrapAsync(reviewController.createReview));



//  delete route for the reviews from show ejs
router.delete("/:reviewId", isLoggedin, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;