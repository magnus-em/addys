const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Package = require('./package')

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

// addySchema.virtual('header').get(function() {
//     return (this.title + " " + this.city)
// })

addySchema.post('findOneAndDelete', async function(addy) {
    if (addy.packages.length) {
        const res = await Package.deleteMany({_id: {$in : addy.packages}})
        console.log(res)
    }
})

module.exports = mongoose.model('Addy',addySchema, 'addys');