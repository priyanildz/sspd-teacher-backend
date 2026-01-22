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
  from: String,
  to: String,
  timetable: [
    {
      day: String,
      periods: [
        {
          periodNumber: Number,
          subject: String,
          teacher: mongoose.Schema.Types.ObjectId,
          teacherName: String,
          time: String
        }
      ]
    }
  ]
});


module.exports = mongoose.model('Timetable', timetableSchema, "timetables");
