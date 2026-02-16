const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  students: [
    {
      // Changed to Mixed and required: false to prevent 500 errors
      studentid: { type: mongoose.Schema.Types.Mixed, required: false }, 
      studentname: { type: String, required: true },
      remark: { type: String, required: true } 
    }
  ]
}, { timestamps: true });

// Explicitly link to your existing collection
module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema, 'studentattendences');