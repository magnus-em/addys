const mongoose = require('mongoose');
const {Schema} = mongoose;


const reviewSchema = new Schema({
    rating: Number,
    body: String,
    recommended: Boolean,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created: {
        type: Date,
        default: Date.now()
    },
    displayName: String 
})

module.exports = mongoose.model("Review", reviewSchema)

