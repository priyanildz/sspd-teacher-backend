const StudentAttendance = require('../models/StudentAttendance');

exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    
    // This finds existing attendance for that day/class or creates a new one
    let record = await StudentAttendance.findOneAndUpdate(
      { date, std, div },
      { students },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      success: true, 
      message: "Attendance saved successfully", 
      data: record 
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
};