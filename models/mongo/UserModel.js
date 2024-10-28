const mongoose = require( 'mongoose' );
const AutoIncrement = require( 'mongoose-sequence' )( mongoose );

const userSchema = new mongoose.Schema( {
    firstName: {
        type: String,
        required: [ true, 'Please tell your username' ]
    },
    lastName: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: [ true, 'Please tell your username' ]
    },
    password: {
        type: String,
        required: [ true, 'Please tell your username' ]
    },
    lastSeen: {
        type: Date
    },
    socketId: {
        type: String,
    },
    nativeLanguage: {
        type: String,
    },
    ages: {
        type: Number,
    },
    imagePath: {
        type: String,
    },
} )

const Users = mongoose.model( "Users", userSchema );

module.exports = Users;