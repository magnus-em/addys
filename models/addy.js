const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Package = require('./package');
const Review = require('./review');


const addySchema = new Schema({
    address1: String,
    address2: String,
    city: String,
    state: String,
    zip: String,
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
    ]
})

addySchema.post('findOneAndDelete', async function(addy) {
    if (addy.packages.length) {
        const res = await Package.deleteMany({_id: {$in : addy.packages}})
        console.log(res)
    }
    if (addy.reviews.length) {
        const res = await Review.deleteMany({_id: {$in: addy.reviews}})
    }
})

addySchema.virtual('totalReviews').get(function() {
    return this.reviews.length;
})
addySchema.virtual('avgRating').get(function() {
    let i = 0
    for (let r of this.reviews) {
        i+=r.rating;
    }
    return i/this.reviews.length;
})

addySchema.virtual('totalRating').get(function() {
    let one=0,two=0,three=0,four=0,five = 0;
    for (let r of this.reviews) {
        console.log(r.rating);
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




module.exports = mongoose.model('Addy',addySchema, 'addys');