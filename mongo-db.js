const mongoose = require('mongoose');
const MessageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: Date
});

const Message = mongoose.model('Message', MessageSchema);

app.post('/messages', async (req, res) => {
  const newMessage = new Message({
    sender: req.body.sender,
    content: req.body.message,
    timestamp: new Date()
  });
  await newMessage.save();
  res.status(201).send('Message saved');
});
