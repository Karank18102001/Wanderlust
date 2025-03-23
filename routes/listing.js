const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js"); // require wrap async
const Listing = require("../models/listing.js");
const mongoose = require("mongoose");
const {isLoggedin,isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});

// index and create route created using the router.route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedin, upload.single("listing[image]"),validateListing, wrapAsync(listingController.createListing));


//  NEW route
router.get("/new", isLoggedin,listingController.renderNewForm);

// show update and delete routes
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedin,isOwner, validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedin,isOwner, wrapAsync(listingController.destroyListing));
        
    //      EDIT ROUTE
router.get("/:id/edit", isLoggedin,isOwner, wrapAsync(listingController.renderEditForm));
    
    


module.exports = router;