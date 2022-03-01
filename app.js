const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate')
const Package = require('./models/package')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const addyRoutes = require('./routes/addys')
const packageRoutes = require('./routes/packages')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')

const uri = 'mongodb+srv://user0:HCexMtrgJ66vXwWr@cluster0.thod1.mongodb.net/devDb?retryWrites=true&w=majority';

mongoose.connect(uri)

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//set EJS
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// to get data out of post requests body
app.use(express.urlencoded({ extended: true }));

const sessionConfig = {
    secret: 'demosecret', 
    resave: 'false', 
    saveUninitialized: 'false',
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24,
        maxAge: 100*60*60*24
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())




//specify static asset path
app.use('/public', express.static('public'));

//method override for html forms
app.use(methodOverride('_method'));

//save any req.flash messages to res.locals (local variables available to views)
app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    res.locals.user = req.user;
    next();
})

app.use('/addys',addyRoutes)
app.use('/',packageRoutes)
app.use('/addys/:addyId/reviews',reviewRoutes)
app.use('/', userRoutes)


app.get('/', (req, res) => {
    res.render('home');
})
app.get('/index', (req, res) => {
    res.render('home');
})
app.get('/faq', (req,res) => {
    res.render('faq')
})
app.get('/terms', (req,res) => {
    res.render('terms')
})
app.get('/privacy', (req,res) => {
    res.render('privacy')
})
app.get('/contact',(req,res) => {
    res.render('contact')
})
app.get('/requirements',(req,res) => {
    res.render('requirements')
})
app.get('/reshipper', catchAsync(async(req,res, next) => {
    res.render('reshipper')
}))

app.use((err, req, res, next) => {
    const { status = 501, message = 'something went very wrong' } = err
    console.log('MESSAGE: ' + message)
    param = {message}
    res.status(status).render('error', {param})
})

// app.all('*', (req,res) => {
//     res.status(404).render('notfound')
// })

app.use((req, res) => {
    res.status(404).render('notfound')
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('app listening on port' + port)
})
