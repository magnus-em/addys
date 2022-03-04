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
    uploaded: Date,
    images: [
        {
            url: String,
            filename: String
        }  
    ],
    addy: {type: Schema.Types.ObjectId, ref: 'Addy'},
    user: {type: Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Package',packageSchema)