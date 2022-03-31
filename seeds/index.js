const mongoose  = require('mongoose');
const Addy = require('../models/addy')
const Review = require('../models/review')
const Package = require('../models/package')
const User = require('../models/user')
const cities = require('./cities')
const titles = require('./seedHelpers');
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
    for (let i=0;i<3;i++) {
        const a = addresses[Math.floor(Math.random() * addresses.length)]
        const c = new Addy({
            street1: a.street1,
            city: a.city,
            state: a.state,
            zip: a.postalCode
        })
        console.log(c.street1)
        await c.save()
    }
    console.log('Addys deleted and seeded')
}

const clearAddys = async () => {
    await Addy.deleteMany({});
    console.log('Addys deleted')
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
    const user = new User({ email:'admin@addys.io', username:'admin', type: 'ADMIN', firstName: 'Magnus', lastName: 'Melbourne', phone:'4243336392' })
    const registeredUser = await User.register(user, 'Mail3kd@')
    console.log('Users deleted and admin created')
    console.log(registeredUser)
}


clearReviews();
clearPackages();
clearUsers();
clearAddys();





