const Joi = require("joi");
module.exports.addySchema = Joi.object({
    addy: Joi.object({
        street1: Joi.string().required(),
        city: Joi.string().required()
    }).required()
})
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        body: Joi.string().max(400).required(),
        displayName: Joi.string().min(0)
    }).required()
})

