const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});
// this plugin will automatically add password, 
// also making sure username aren't duplicated to the schema
//and also gives us additional methods
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);