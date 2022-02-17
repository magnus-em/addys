const mongoose = require('mongoose');
const schema = mongoose.Schema;

const addy = new schema({
    title: {type:String, required:true},
    subscriberCount: Number,
    tier: Number,
    city: String,
    state: String
})

addy.virtual('header').get(function() {
    return (this.title + " " + this.city)
})

module.exports = mongoose.model('Addy',addy);