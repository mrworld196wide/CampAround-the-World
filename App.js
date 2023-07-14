const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// adding ejs mate
const ejsMate = require('ejs-mate');
// importing utilities function
const ExpressError = require('./utils/ExpressError');
//methodOverride middleware allows us to use HTTP verbs such as PUT or DELETE in HTML forms
const methodOverride = require("method-override");
//importing routes
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,   //don't use this in newer versions as it has been deprecated from mongoose
    useUnifiedTopology: true
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
// The urlencoded method tells to extract data 
// from the <form> element 
// and add them to the body property in the request object.
app.use(express.urlencoded({ extended: true }));
// The _method parameter specifies the query parameter or form field name that 
// will be used to override the HTTP method. like DELELTE and PUT
app.use(methodOverride('_method'));


// using routes 
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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





