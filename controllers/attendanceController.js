const StudentAttendance = require('../models/StudentAttendance');

exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    let record = await StudentAttendance.findOne({ date, std, div });

    if (record) {
      record.students = students;
      await record.save();
    } else {
      record = new StudentAttendance({ date, std, div, students });
      await record.save();
    }
    res.status(201).json({ message: "Attendance saved", data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};