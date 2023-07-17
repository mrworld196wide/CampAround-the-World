const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// adding ejs mate
const ejsMate = require('ejs-mate');
//importing session
const session = require('express-session');
const flash = require('connect-flash');
// importing utilities function
const ExpressError = require('./utils/ExpressError');
//methodOverride middleware allows us to use HTTP verbs such as PUT or DELETE in HTML forms
const methodOverride = require("method-override");
// importing passport and modules
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

//importing routes
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,   //don't use this in newer versions as it has been deprecated from mongoose
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected successfully!");
});

const app = express();

// adding ejs-mate
app.engine('ejs', ejsMate);
// adding  ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// used to parse ejs body in post method
// The urlencoded method tells to extract data from the <form> element 
// and add them to the body property in the request object.
app.use(express.urlencoded({ extended: true }));
// The _method parameter specifies the query parameter or form field name that 
// will be used to override the HTTP method. like DELELTE and PUT
app.use(methodOverride('_method'));

//used to serve static files in public dir
app.use(express.static(path.join(__dirname, 'public')))

// creating session 
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        // cookie will expiry in a week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
//keep in mind to keep following before passport session
app.use(session(sessionConfig))

// using flash
app.use(flash());

//passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
//serializing user i.e. storing user into the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//flash responses
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    // for success
    res.locals.success = req.flash('success');
    // for errors
    res.locals.error = req.flash('error');
    next();
})

// using routes 
app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes)

// home.ejs
app.get('/', (req, res) => {
    res.render('home')
});


// app.all() method, which is used to handle all HTTP 
// methods (GET, POST, PUT, DELETE, etc.) for a given route.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

//default error handler with error template
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

// configuring the server
app.listen(3000, () => {
    console.log('Serving on port 3000')
})





