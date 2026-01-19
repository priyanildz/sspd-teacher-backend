const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  std: String,
  className: String,
  publishTo: String,
  subject: String,
  message: String,
  date: { type: Date, default: Date.now },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['draft', 'sent'], default: 'draft' }
});

module.exports = mongoose.model('Announcement', announcementSchema);
