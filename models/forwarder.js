const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const fwSchema = new Schema({
    email: {
        type: String,
        required: [true, 'email cannot be blank'],
        unique: true,
    },
    firstName: String,
    lastName: String,
    addy: {
        type: Schema.Types.ObjectId,
        ref: 'Addy'
    }
})

fwSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("Forwarder", fwSchema);