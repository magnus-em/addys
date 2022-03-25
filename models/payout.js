const mongoose = require('mongoose');
const { Schema } = mongoose;

const payoutSchema = new Schema({
    date: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['CASHAPP', 'VENMO', 'PAYPAL'],
    },
    username: {
        type: String,
        requried: true
    },
    name: {
        type: String,
        required: true
    },
    transaction: String,
    amount: String,

})

module.exports.Payout = mongoose.model('Payout',payoutSchema)
module.exports.payoutSchema = payoutSchema;