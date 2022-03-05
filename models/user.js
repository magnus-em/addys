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

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);