const mongoose = require('mongoose');
const {Schema} = mongoose;

const packageSchema = new Schema({
    tracking: {
        type: String,
        required: [true, 'Package must have tracking']
    },
    shipper: {
        type: String,
        required: [true, 'Package must have a shipper']
    },
    weight: Number,
    carrier: {
        type: String,
        enum : ['USPS','FEDEX','UPS','DHL','ONTRAC'],
    },
    length: Number,
    width: Number,
    height: Number,
    uploaded: {type: Date, default: Date.now},
    images: [
        {
            url: String,
            filename: String
        }  
    ],
    mailbox: Number,
    status: {
        type: String,
        enum: ['NEW','PENDING','FORWARDED']
    },
    addy: {type: Schema.Types.ObjectId, ref: 'Addy'},
    user: {type: Schema.Types.ObjectId, ref: 'User'},
    label_url: String,
    tracking_number: String,
    tracking_url_provider: String,
    shippo: {}
})

module.exports = mongoose.model('Package',packageSchema)