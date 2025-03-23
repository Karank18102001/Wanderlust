const Listing = require("./models/listing");
const Review = require("./models/review")
const ExpressError = require("./utils/ExpressError.js"); // express error
const {listingSchema, reviewSchema} = require("./schema.js"); // required JOI in the schema.js


module.exports.isLoggedin = (req,res,next) =>
{
    if(!req.isAuthenticated() )
    {
        req.session.redirectUrl = req.originalUrl;
        req.flash("Error!"," login to create a new listing.");
        return res.redirect("/login");
    };
    next();    
}

module.exports.saveRedirectUrl = (req,res,next) =>
{
    if(req.session.redirectUrl)
    {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}

module.exports.isOwner = async (req,res,next) =>
{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id))
    {
        req.flash("error","Unauthorised owner!");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req,res,next) =>
{
    //validate schema for JOI in create for listing and review
        let {error} = listingSchema. validate(req.body);
        if(error)
        {
            let errorMessage = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,errorMessage);
        }
        else{
            next();
        }
}

module.exports.validateReview = (req,res,next) =>
{
        let {error} = reviewSchema.validate(req.body);
        if(error)
        {
            let errorMessage = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400,errorMessage);
        }
        else{
            next();
        }
}

module.exports.isReviewAuthor = async (req,res,next) =>
    {
        let {id, reviewId} = req.params;
        let review = await Review.findById(reviewId);
        if(!review.author.equals(res.locals.currUser._id))
        {
            req.flash("error","Unauthorised author!");
            return res.redirect(`/listings/${id}`);
        }
        next();
    }