const express=require("express");
const router=express.Router({ mergeParams: true });
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const {reviewSchema} = require("../schema.js");
const {isLoggedIn ,isReviewAuthor} = require("../middleware.js");
const {create, deleteroute} = require("../controllers/reviews.js");

const validateReview=(req,res,next)=>{
    let {error}=reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
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