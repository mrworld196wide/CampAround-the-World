const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// adding ejs mate
const ejsMate = require('ejs-mate');
//methodOverride middleware allows us to use HTTP verbs such as PUT or DELETE in HTML forms
const methodOverride = require("method-override");
const Campground = require('./models/campground');
// importing utilities function
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    // useCreateIndex: true,   //don't use this as it has been deprecated from mongoose
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
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

// home.ejs
app.get('/', (req, res) => {
    res.render('home')
});

// index.ejs
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}));

// new.ejs
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});
app.post('/campgrounds', catchAsync(async (req, res, next) => {
    if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}));

// show.ejs
app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/show', { campground });
}));

// edit.ejs
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}));
app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    // res.send("It worked!");
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`);
}));

// Deleting a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// app.all() method, which is used to handle all HTTP 
// methods (GET, POST, PUT, DELETE, etc.) for a given route.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
});

// configuring the server
app.listen(3000, () => {
    console.log('Serving on port 3000')
});

