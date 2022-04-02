if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const methodOverride = require('method-override')
const mongoose = require('mongoose');
const mongoSanitize = require('express-mongo-sanitize')
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
const fwRoutes = require('./routes/forwarder')
const adminRoutes = require('./routes/admin')
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')




mongoose.connect(process.env.MONGO_DB)


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//set EJS
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(path.join(__dirname, 'public')))
app.use(methodOverride('_method'));
app.use(mongoSanitize())




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






// put this in staticfiles.config
// option_settings:
//   aws:elasticbeanstalk:environment:proxy:staticfiles:
//     /public: /public
// //method override for html forms


//save any req.flash messages to res.locals (local variables available to views)
app.use((req,res,next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    res.locals.user = req.user;
    res.locals.title = 'Addys: US residential addresses for global package forwarding'
    res.locals.description = 'Addys offers fast and reliable, global package forwarding from real US residential addresses. Scale your resale business with Addys.'
    next();
})

app.use('/locations',addyRoutes)
app.use('/',packageRoutes)
app.use('/locations/:addyId/reviews',reviewRoutes)
app.use('/', userRoutes)
app.use('/forwarder', fwRoutes)
app.use('/admin', adminRoutes)


app.get('/', (req, res) => {
    res.render('home');
})



app.get('/index', (req, res) => {
    res.render('home');
})
app.get('/faq', (req,res) => {
    res.locals.title = "Addys - FAQ"
    res.locals.description = "All the answers to any questions you have about Addys and package forwarding"
    res.render('details/faq')
})
app.get('/cookies',(req,res) => {
    res.locals.title = "Cookie policy"
    res.locals.description = "View Addys' cookie policy"
    res.render('details/cookies')
})
app.get('/terms', (req,res) => {
    res.locals.title = "Terms of Service"
    res.locals.description = "View Addy's terms of service"
    res.render('details/terms')
})
app.get('/privacy', (req,res) => {
    res.locals.title = "Privacy"
    res.locals.description = "View Addys' privacy policy"
    res.render('details/privacy')
})

app.get('/disclaimer', (req,res) => {
    res.locals.title = "Disclaimer"
    res.locals.description = "View Addys' disclaimer"
    res.render('details/disclaimer')
})

app.get('/contact',(req,res) => {
    res.locals.title = "Contact Us"
    res.locals.description = "Any questions? Send us an email at contact@addys.io"
    res.render('contact')
})
app.get('/riskdisclosure',(req,res) => {
    res.locals.title = "Risk Disclosure Statement"
    res.locals.description = "View our risk disclosure statement"
    res.render('details/risk_disclosure_statement')
})


app.get("/sitemap.xml", function(req, res, next){
    res.sendFile(__dirname + '/public/assets/sitemap.xml'); 
  })
  app.get("/robots.txt", function(req, res, next){
    res.sendFile(__dirname + '/public/assets/robots.txt'); 
  })

app.use((err, req, res, next) => {
    const { status = 501, message = 'something went very wrong' } = err
    console.log('MESSAGE: ' + message)
    console.error('STACK: ' + err.stack)
    param = {message}
    res.status(status).render('details/error', {param})
})

// app.all('*', (req,res) => {
//     res.status(404).render('notfound')
// })

app.use((req, res) => {
    res.status(404).render('details/notfound')
})

const port = process.env.PORT || 3001
app.listen(port, () => {
    console.log('app listening on port' + port)
})
