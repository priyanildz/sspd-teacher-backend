const StudentAttendance = require('../models/StudentAttendance');

exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    
    // Find the record in the original collection and update it, or create if it doesn't exist
    let record = await StudentAttendance.findOneAndUpdate(
      { date, std, div },
      { students },
      { new: true, upsert: true }
    );

    res.status(201).json({ 
      success: true, 
      message: "Attendance updated in original collection", 
      data: record 
    });
  } catch (error) {
    console.error("Attendance Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message 
    });
  }
};