const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// adding ejs mate
const ejsMate = require('ejs-mate');
// importing JOI part
const { campgroundSchema, reviewSchema } = require('./schemas.js');
// importing utilities function
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
//methodOverride middleware allows us to use HTTP verbs such as PUT or DELETE in HTML forms
const methodOverride = require("method-override");
const Campground = require('./models/campground');
const Review = require('./models/review');

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

// JOI part to validate the camprgrounds
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
// for review Schema
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

// home.ejs
app.get('/', (req, res) => {
    res.render('home')
});

// index.ejs
app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds })
}));

// new.ejs
app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});
// for posting 
app.post('/campgrounds', validateCampground, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
}))

// show.ejs
app.get('/campgrounds/:id', catchAsync(async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
}));

// edit.ejs
app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
}))
app.put('/campgrounds/:id', validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    res.redirect(`/campgrounds/${campground._id}`)
}));

// Deleting a campground
app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

// review routes 
// //saving review
app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}))

// deleting review
app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))


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