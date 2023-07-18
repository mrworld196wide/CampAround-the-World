const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
// importing controllers
const users = require('../controllers/users');

//register user view
router.get('/register', users.renderRegister);

//registering the user 
router.post('/register', catchAsync(users.register));

//login user view
router.get('/login', users.renderLogin)
//checking from the database to authenticate the user
router.post('/login', passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

//logout route
router.get('/logout', users.logout)


// in latest verion of passportJS following is the logic for logout
// router.get('/logout', (req, res, next) => {
//     req.logout(function (err) {
//         if (err) {
//             return next(err);
//         }
//         req.flash('success', 'Goodbye!');
//         res.redirect('/campgrounds');
//     });
// }); 

module.exports = router;