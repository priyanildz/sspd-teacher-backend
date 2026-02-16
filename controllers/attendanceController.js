const StudentAttendance = require('../models/StudentAttendance');

// Adds a new attendance record
exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;

    // Optional: Check if attendance for this date, std, and div already exists
    const existingAttendance = await StudentAttendance.findOne({ date, std, div });

    if (existingAttendance) {
      // Update existing record
      existingAttendance.students = students;
      await existingAttendance.save();
      return res.status(200).json({ 
        message: "Attendance updated successfully", 
        data: existingAttendance 
      });
    }

    // Create a new record
    const newAttendance = new StudentAttendance({
      date,
      std,
      div,
      students
    });

    await newAttendance.save();
    res.status(201).json({ 
      message: "Attendance recorded successfully", 
      data: newAttendance 
    });

  } catch (error) {
    res.status(500).json({ 
      message: "Error saving attendance", 
      error: error.message 
    });
  }
};