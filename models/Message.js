// models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  timestamp: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false, // ✅ unread by default
  },
});


module.exports = mongoose.model('Message', MessageSchema);
