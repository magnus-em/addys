const Joi = require('joi')
module.exports = function validateAddy(req,res,next) {
    const addySchema = Joi.object({
        addy: Joi.object({
            address1: Joi.string().required(),
            city: Joi.string().required()
    })})

    const {error, value} = addySchema.validate(req.body)
    console.log(addySchema.validate(req.body))
    console.dir("joi error " + error)
    console.dir('joi value ' + value)
    if (error) {
        console.log('*****prerror')
        console.log(error.details)
        throw new ExpressError(error.details[0].message, 404)
    } else {
        next()
    }
}