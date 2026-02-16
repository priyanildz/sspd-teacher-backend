// models/StudentAttendance.js
const mongoose = require('mongoose');

// models/StudentAttendance.js
const studentAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  students: [
    {
      // Changed from ObjectId to Mixed to support both 'S-2025-001' strings and ObjectIds
      studentid: { type: mongoose.Schema.Types.Mixed, required: false }, 
      studentname: { type: String, required: true },
      remark: { type: String, required: true } 
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema, 'studentattendences');