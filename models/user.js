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
    isAdmin: {
        type: Boolean,
        default: false
    },
    isForwarder: {
        type: Boolean,
        default: false
    }
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