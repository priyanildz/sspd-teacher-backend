// models/StudentAttendance.js
const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  students: [
    {
      // Remove required: true to prevent 500 errors when studentid is null
      studentid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false }, 
      studentname: { type: String, required: true },
      remark: { type: String, required: true } // "P" or "A"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema, 'studentattendences');