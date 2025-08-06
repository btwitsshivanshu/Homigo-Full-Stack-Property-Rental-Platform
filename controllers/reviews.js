const Review= require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn ,isReviewAuthor} = require("../middleware.js");


module.exports.deleteroute=async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});

    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted the review!");
    res.redirect(`/listings/${id}`);
}


module.exports.create=async(req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id; // Set the author to the currently logged-in user
    listing.reviews.push(review);
    await review.save();
    await listing.save();

    req.flash("success", "Successfully added a new review!");
    res.redirect(`/listings/${id}`);
    
}