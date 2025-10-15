const Review= require("../models/review.js");
const Listing=require("../models/listing.js");
const {isLoggedIn ,isReviewAuthor} = require("../middleware.js");


module.exports.deleteroute = async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    if (!deletedReview) {
        return res.status(404).json({ message: "Review not found!" });
    }
    res.json({ message: "Successfully deleted the review!" });
};


module.exports.create = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return res.status(404).json({ message: "Listing not found!" });
    }
    const review = new Review(req.body.review);
    review.author = req.user.id; // Set the author to the currently logged-in user (JWT)
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    await review.populate('author');
    res.status(201).json(review);
};