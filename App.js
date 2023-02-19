const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride= require("method-override");
const Campground = require('./models/campground');

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

// used to parse ejs body in post method
app.use(express.urlencoded({ extended: true }));
// methodOverride
app.use(methodOverride('_method'));

// adding  ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// home.ejs
app.get('/', (req, res) => {
    res.render('home')
});

// index.ejs
app.get('/campgrounds', async(req, res) =>{
    const campgrounds= await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
})

// new.ejs
app.get('/campgrounds/new', (req, res) =>{
    res.render('campgrounds/new');
})
app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`)
})

// show.ejs
app.get('/campgrounds/:id', async(req, res) =>{
    const campground= await Campground.findById(req.params.id)
    res.render('campgrounds/show', {campground});
})

// edit.ejs
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', { campground });
})
app.put('/campgrounds/:id', async (req, res) => {
    // res.send("It worked!");
    const {id} = req.params;
    const campground= await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
})

// Deleting a campground
app.delete('/campground/:id', async(req,res) =>{
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

// configuring the server
app.listen(3000, () => {
    console.log('Serving on port 3000')
})