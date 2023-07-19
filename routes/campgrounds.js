const express = require('express');
const router = express.Router();
// importing utilities function
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const campgrounds = require('../controllers/campgrounds');
const Campground = require('../models/campground');
// image uploading packages
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    // index.ejs
    .get(catchAsync(campgrounds.index))
    // for posting 
    // here upload.array is used to upload multiple files at same time 
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.createCampground))

// new.ejs
router.get('/new', isLoggedIn, campgrounds.renderNewForm)


router.route('/:id')
    // show.ejs
    .get(catchAsync(campgrounds.showCampground))
    // edit.ejs
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
    // Deleting a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

//rendering edit.ejs
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm))

module.exports = router;