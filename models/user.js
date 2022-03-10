const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'email cannot be blank'],
        unique: true,
    },
    firstName: String,
    lastName: String,
    phone: String,
    packages: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Package'
        }
    ],
    addy: {
        type: Schema.Types.ObjectId,
        ref: 'Addy'
    },
    mailbox: Number,
    type: {
        type: String,
        enum: ['CLIENT','FW','ADMIN']
    },
    balance: {
        type: Number,
        default: 0
    },
    

    addresses: [
        {
            name: {
                type: String,
                required: true
            },
            company: String,
            street1: {
                type: String,
                required: true
            },
            street_no: String,
            street2: String,
            street3: String,
            city: {
                type: String,
                required: true
            },
            zip: {
                type: String,
                required: true
            },
            state: {
                type: String,
                required: true
            },
            country: {
                type: String,
                required: true
            },
            phone: String,
            email: String,
        }
    ]
})

userSchema.virtual('totalNew').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "NEW"){
            i++;
        }
    }
    return i;
})
userSchema.virtual('totalPending').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "PENDING"){
            i++;
        }
    }
    return i;
})
userSchema.virtual('totalForwarded').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "FORWARDED"){
            i++;
        }
    }
    return i;
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);