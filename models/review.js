const { Mongoose, Schema } = require("mongoose");

const reviewSchema = new Schema({
    rating: Number,
    body: String,
     
})

module.exports = mongoose.model("Review", reviewSchema)