const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
    sender: {
        type: String,
        ref: 'Users',
        required: true
    },
    receiver: {
        type: String,
        ref: 'Users',
        required: true
    }
});

const FriendRequests = mongoose.model("FriendRequests", friendRequestSchema);

module.exports = FriendRequests;
