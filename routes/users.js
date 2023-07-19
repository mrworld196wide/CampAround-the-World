const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');
// importing controllers
const users = require('../controllers/users');

router.route('/register')
    //register user view
    .get(users.renderRegister)
    //registering the user 
    .post(catchAsync(users.register));

router.route('/login')
    //login user view
    .get(users.renderLogin)
    //checking from the database to authenticate the user
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login)

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