const Joi = require('joi')
const {reviewSchema, addySchema} = require('./joiSchemas')
const ExpressError = require('./ExpressError')

module.exports.validateAddy = function(req,res,next) {

    const {error, value} = addySchema.validate(req.body)
    console.log(addySchema.validate(req.body))
    console.dir("joi error " + error)
    console.dir('joi value ' + value)
    if (error) {
        console.log('*** JOI ADDY ERROR ***')
        console.log(error.details)
        throw new ExpressError(error.details[0].message, 404)
    } else {
        next()
    }
}

module.exports.validateReview =  (req,res,next) => {
    const {error} = reviewSchema.validate(req.body)
    if (error) {
        console.log('*** JOI REVIEW ERROR ***')
        console.log(error.details)
        throw new ExpressError(error.details[0].message, 404)
    } else {
        next()
    }
}
