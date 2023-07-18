const express = require('express');
const router = express.Router();
// importing utilities function
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const Campground = require('../models/campground');


// index.ejs
router.get('/', catchAsync(campgrounds.index));

// new.ejs
router.get('/new', isLoggedIn, campgrounds.renderNewForm)

// for posting 
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground))

// show.ejs
router.get('/:id', catchAsync(campgrounds.showCampground));

// edit.ejs
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// Deleting a campground
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;