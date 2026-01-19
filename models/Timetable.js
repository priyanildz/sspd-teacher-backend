const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
  period: Number,
  time: String,
  subject: String,
  teacher: String,
});

const daySchema = new mongoose.Schema({
  day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], required: true },
  entries: [timetableEntrySchema],
});

const timetableSchema = new mongoose.Schema({
  standard: String,
  division: String,
  timetable: [daySchema],
});

module.exports = mongoose.model('Timetable', timetableSchema);
