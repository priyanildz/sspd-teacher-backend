// models/StudentAttendance.js
const mongoose = require('mongoose');

// models/StudentAttendance.js
// models/StudentAttendance.js
const studentAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  students: [
    {
      studentid: { type: String, required: true }, // ✅ Enforce String ID
      studentname: { type: String, required: true },
      remark: { type: String, required: true } 
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema, 'studentattendences');