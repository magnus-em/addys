const mongoose  = require('mongoose');
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const User = require('../models/user')
const cities = require('./cities')
const titles = require('./seedHelpers')
const addresses = require('./addresses.json').addresses


const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/devDb?retryWrites=true&w=majority';
mongoose.connect(uri)



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDb = async () => {
    await Addy.deleteMany({});
    for (let i=0;i<20;i++) {
        const a = addresses[Math.floor(Math.random() * addresses.length)]
        const c = new Addy({
            address1: a.address1,
            city: a.city,
            state: a.state,
            zip: a.postalCode
        })
        console.log(c.address1)
        await c.save()
    }
    console.log('Addys deleted and seeded')
}

const clearReviews = async () => {
    await Review.deleteMany({})
    console.log('Reviews deleted')
}

const clearPackages = async() => {
    await Package.deleteMany({})
    console.log('Packages deleted')
}

const clearUsers = async() => {
    await User.deleteMany({})
    console.log('Users deleted')
}

clearReviews();
clearPackages();
clearUsers();
seedDb();



