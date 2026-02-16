const StudentAttendance = require('../models/StudentAttendance');

// Fetch attendance for a specific class and date
exports.getAttendanceByDate = async (req, res) => {
  try {
    const { std, div, date } = req.params;
    const record = await StudentAttendance.findOne({ std, div, date });
    if (!record) return res.status(404).json({ message: "No attendance found" });
    res.status(200).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update existing or Create new (already matches your screenshot request)
exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    const record = await StudentAttendance.findOneAndUpdate(
      { date, std, div },
      { students },
      { new: true, upsert: true }
    );
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};