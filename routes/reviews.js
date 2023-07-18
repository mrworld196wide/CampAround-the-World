const express = require('express');
const router = express.Router({ mergeParams: true });

const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
// importing utilities function
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');

// review routes 
// //saving review
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

//deleting review
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;