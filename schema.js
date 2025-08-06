const Joi= require('joi');
const review = require('./models/review');


module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0), 
        description: Joi.string().required(),
        location: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().allow(null, ''),
            filename: Joi.string().allow(null, '')
        }).allow(null),
        country: Joi.string().required(),
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        comment: Joi.string().required(),
        rating: Joi.number().required().min(1).max(5),
    }).required(),
});