const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: String,
    password: String,
    firstName: String,
    lastName: String,
    jobRole: String,
    city: String,
    country: String,
    phone:String
}, {
    timestamps: true
});

module.exports = model('User', userSchema, 'users');