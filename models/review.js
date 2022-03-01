const mongoose = require('mongoose');
const {Schema} = mongoose;


const reviewSchema = new Schema({
    rating: Number,
    body: String,
    recommended: Boolean
})

module.exports = mongoose.model("Review", reviewSchema)