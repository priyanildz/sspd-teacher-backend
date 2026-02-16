const mongoose = require('mongoose');

const studentAttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true },
  std: { type: String, required: true },
  div: { type: String, required: true },
  students: [
    {
      studentid: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      studentname: { type: String, required: true },
      remark: { type: String, required: true } // "P" or "A"
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('StudentAttendance', studentAttendanceSchema, 'studentattendences');