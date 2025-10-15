const Review = require("./models/review");
const { verifyJWT } = require('./middleware/auth');

// Use JWT verification as isLoggedIn
module.exports.isLoggedIn = verifyJWT;

// No redirect logic with APIs; keep for compatibility (no-op)
module.exports.saveRedirectUrl = (_req, _res, next) => next();

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    const userId = req.user?.id; // from JWT payload
    if (!review || !review.author || String(review.author) !== String(userId)) {
        return res.status(403).json({ message: "Forbidden: Not review author" });
    }
    next();
}