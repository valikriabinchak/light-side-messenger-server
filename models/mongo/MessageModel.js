const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        ref: 'Users',
        required: true
    },
    receiver: {
        type: String,
        ref: 'Users',
        required: true
    },
    content: {
        type: String,
        required: [true, 'Message content cannot be empty']
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Messages = mongoose.model("Messages", messageSchema);

module.exports = Messages;
