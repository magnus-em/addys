const express = require('express');
const methodOverride = require('method-override')
const mongoose  = require('mongoose');
const app = express();
const path = require('path');
const Addy = require('./models/addy')

// mongoose.connect('mongodb://localhost:27017/addyApp')


const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';


mongoose.connect(uri)


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});







//set EJS
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));


//static asset
app.use('/public', express.static('public'));

app.use(methodOverride('_method'));

app.get('/',(req,res) => {
    res.render('home');
})
app.get('/index',(req,res) => {
    res.render('home');
})

// show all addys
app.get('/addys', async (req,res) => {
    const addys = await Addy.find({})
    res.render('addys/index', {addys});
})

// show details for specific addy
app.get('/addys/:id', async (req,res) => {
    const {id} = req.params;
    const addy = await Addy.findById(id)
    console.log(addy)
    if (!addy) {
        res.render('addys/notfound');
    } 
    res.render('addys/details', {addy})
})

app.patch('/addys/:id', async (req,res) => {
    res.redirect('/')
})

app.get('/addys/:id/edit', async (req,res) => {
    const {id} = req.params;
    const addy = await Addy.findById(id)
    res.render('addys/edit', {addy})
})

app.get('/createaddy', async (req,res) => {
    const newAddy = new Addy({tite:'Seattle #1',city:'seattle',tier:1,state:'wa'})
    await newAddy.save();
    res.send(newA)
})

const port = process.env.port || 3001
app.listen(port,() => {
    console.log('app listening on port' + port)
})
