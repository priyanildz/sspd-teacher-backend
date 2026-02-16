const StudentAttendance = require('../models/StudentAttendance');

// Fetch attendance for a specific class and date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { std, div, date } = req.params;
    // Explicitly searching for the class and date
    const record = await StudentAttendance.findOne({ std, div, date });
    
    if (!record) {
      return res.status(404).json({ message: "No record found for this date" });
    }
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Existing addAttendance logic remains same...
exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    let record = await StudentAttendance.findOneAndUpdate(
      { date, std, div },
      { students },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};