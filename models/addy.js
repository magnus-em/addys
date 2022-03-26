const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Package = require('./package');
const Review = require('./review');



const addySchema = new Schema({
    street1: String,
    street2: String,
    city: String,
    state: String,
    zip: String,
    signedUp: {
        type: Date,
        default: Date.now
    },
    forwarder: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    packages: [
        {
            type: Schema.Types.ObjectId, 
            ref: 'Package'
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    clients: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    mailboxCounter: {
        type: Number,
        default: 33
    }
})

addySchema.post('findOneAndDelete', async function(addy) {
    if (addy.packages.length) {
        const res = await Package.deleteMany({_id: {$in : addy.packages}})
    }
    if (addy.reviews.length) {
        const res = await Review.deleteMany({_id: {$in: addy.reviews}})
    }
})

addySchema.virtual('totalReviews').get(function() {
    return this.reviews.length;
})
addySchema.virtual('avgRating').get(function() {
    if (this.reviews.length==0){
        return 0;
    }
    let i = 0
    for (let r of this.reviews) {
        i+=r.rating;
    }
    return i/this.reviews.length;
})

addySchema.virtual('totalRating').get(function() {
    let one=0,two=0,three=0,four=0,five = 0;
    for (let r of this.reviews) {
        switch (r.rating){
            case 1:
                one = 1;
                break;
            case 2:
                two += 1;
                break;
            case 3:
                three += 1;
                break;
            case 4: 
                four += 1;
                break;
            case 5:
                five += 1;
                break;
        }
    }
    return [null,one,two,three,four,five];
})

addySchema.virtual('totalNew').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "NEW") {
            i++;
        }
    }
    return i;
})
addySchema.virtual('totalPending').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "PENDING") {
            i++;
        }
    }
    return i;
})
addySchema.virtual('totalForwarded').get(function() {
    let i = 0;
    for (let p of this.packages) {
        if (p.status == "FORWARDED") {
            i++;
        }
    }
    return i;
})

addySchema.virtual('totalPackages').get(function() {
    let i = 0;
    for (let p of this.packages) {
            i++;
        
    }
    return i;
})

addySchema.virtual('streetNoNumber').get(function() {
    return  this.street1.replace(/[0-9]/g, '');
})






module.exports = mongoose.model('Addy',addySchema, 'addys');