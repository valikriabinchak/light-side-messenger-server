const mongoose = require('mongoose');

const friendRelationSchema = new mongoose.Schema({
    user1Email: {
        type: String,
        ref: 'Users',
        required: true
    },
    user2Email: {
        type: String,
        ref: 'Users',
        required: true
    }
});

const FriendRelations = mongoose.model("FriendRelations", friendRelationSchema);

module.exports = FriendRelations;
