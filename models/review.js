const mongoose = require('mongoose');
const {Schema} = mongoose;


const reviewSchema = new Schema({
    rating: Number,
    body: String,
    recommended: Boolean,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    } 
})

module.exports = mongoose.model("Review", reviewSchema)

