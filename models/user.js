const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    email: {
        type: String,
        required: [true, 'email cannot be blank'],
        unique: true,
    },
    packages: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Package'
        }
    ]
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);