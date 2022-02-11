const mongoose  = require('mongoose');
const Addy = require('../models/addy')
const cities = require('./cities')
const titles = require('./seedHelpers')


const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
mongoose.connect(uri)


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const seedDb = async () => {
    await Addy.deleteMany({});
    for (let i=0;i<100;i++) {
        const rand1 = Math.floor(Math.random()*1000)
        const rand2 = Math.floor(Math.random()*titles.length)
        const c = new Addy({city:cities[rand1].city, title:titles[rand2], state:cities[rand1].state})
        console.log(c.header)
        c.save()
    }

}

seedDb();