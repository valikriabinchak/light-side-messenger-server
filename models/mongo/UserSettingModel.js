const mongoose = require('mongoose');

const userSettignsSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'Please tell your username']
    },
})  

const UserSettings = mongoose.model("UserSettings", userSettignsSchema);

module.exports = UserSettings;