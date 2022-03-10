const mongoose = require('mongoose');
const Addy = require('./addy');
const User = require('./user')
const { Schema } = mongoose;

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
        enum: ['USPS', 'FEDEX', 'UPS', 'DHL', 'ONTRAC'],
    },
    length: Number,
    width: Number,
    height: Number,
    uploaded: { type: Date, default: Date.now },
    forwardedDate: Date,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    receipts: [
        {
            url: String,
            filename: String
        }
    ],
    mailbox: Number,
    status: {
        type: String,
        enum: ['NEW', 'PENDING', 'FORWARDED']
    },
    addy: { type: Schema.Types.ObjectId, ref: 'Addy' },
    client: { type: Schema.Types.ObjectId, ref: 'User' },
    label_url: String,
    tracking_number: String,
    tracking_url_provider: String,
    shippo: {}
})

packageSchema.post('findOneAndDelete', async function (package) {
    if (package.client) {
        await User.findByIdAndUpdate(package.client, { $pull: { packages: package._id } })
    } else {
        const user = await User.findOneAndUpdate({mailbox: package.mailbox, addy: package.addy}, { $pull: { packages: package._id } })
        await user.save()
    }
    const addy = await Addy.findByIdAndUpdate(package.addy, { $pull: { packages: package._id } })

})



module.exports = mongoose.model('Package', packageSchema)