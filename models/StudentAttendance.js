const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  date: {
    type: String, // Stored as "YYYY-MM-DD"
    required: true
  },
  std: {
    type: String,
    required: true
  },
  div: {
    type: String,
    required: true
  },
  students: [
    {
      studentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      studentname: {
        type: String,
        required: true
      },
      remark: {
        type: String, // "P" for Present, "A" for Absent
        required: true
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema);