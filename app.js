const express = require('express');
const methodOverride = require('method-override')
const mongoose  = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
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
app.engine('ejs',ejsMate)
app.set('view engine','ejs');
app.set('views', path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));

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


// delete
app.delete('/addys/:id', async (req,res) => {
    const {id} = req.params;
    const addy = await Addy.findByIdAndDelete(id)
    console.log('delete addy: ',addy)
    res.redirect('/addys')
})

//new addy form
app.get('/addys/new', (req,res) => {
    res.render('addys/new')
})

app.post('/addys', async (req,res) => {
    const addy = new Addy(req.body.addy)
    console.log(addy)
    await addy.save()
    res.redirect(`/addys/${addy._id}`)
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
    const {id} = req.params;
    const {title, city} = req.body;
    const addy = await Addy.findById(id)
    addy.title = title;
    addy.city = city;
    addy.save()
    console.log(title, city, id, addy)
    res.render('addys/details', {addy})
})

app.get('/addys/:id/edit', async (req,res) => {
    const {id} = req.params;
    const addy = await Addy.findById(id)
    res.render('addys/edit', {addy})
})

app.use((req,res) => {
    res.status(404).render('notfound')
})



const port = process.env.PORT || 3001
app.listen(port,() => {
    console.log('app listening on port' + port)
})
