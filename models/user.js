const mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    authId: {type: String,
        unique: true},
    name: String,
    email: String,
    role: String,
    created: Date,
})

userSchema.pre('save', function (next) {
    if(!this.created) this.created = new Date();
    next();

})
const User = mongoose.model('User', userSchema)
module.exports.User =  User