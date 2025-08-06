const express=require("express");
const router=express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");  
const Review= require("../models/review.js")
const Listing=require("../models/listing.js")
const {isLoggedIn ,isReviewAuthor} = require("../middleware.js");
const {create, deleteroute} = require("../controllers/reviews.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    console.log(error);
    if(error){
        throw new ExpressError(400, error.details[0].message);
    }
    else{
        next();
    }
}

// post Review Routes
router.post("/",isLoggedIn,validateReview, wrapAsync(create));


//delete Review Route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(deleteroute));


module.exports = router;