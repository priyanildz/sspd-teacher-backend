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
// exports.addAttendance = async (req, res) => {
//   try {
//     const { date, std, div, students } = req.body;
//     let record = await StudentAttendance.findOneAndUpdate(
//       { date, std, div },
//       { students },
//       { new: true, upsert: true }
//     );
//     res.status(201).json({ success: true, data: record });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


// attendanceController.js
exports.addAttendance = async (req, res) => {
  try {
    const { date, std, div, students } = req.body;
    
    // Debug log to see exactly what Flutter is sending
    console.log("Incoming Attendance Data:", JSON.stringify(req.body, null, 2));

    let record = await StudentAttendance.findOneAndUpdate(
      { date, std, div },
      { students },
      { new: true, upsert: true }
    );
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.getStudentMonthlySummary = async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Validate the studentId before querying
    if (!studentId || studentId === "null" || studentId === "undefined") {
      return res.status(400).json({ success: false, message: "Valid Student ID is required" });
    }

    const db = mongoose.connection.db;
    
    // 2. Build a flexible query to handle both String and ObjectId
    let queryId = studentId;
    try {
        if (mongoose.Types.ObjectId.isValid(studentId)) {
            queryId = new mongoose.Types.ObjectId(studentId);
        }
    } catch (e) {
        console.log("Not an ObjectId, treating as string.");
    }

    const summary = await db.collection('studentattendences').aggregate([
      { $unwind: "$students" },
      { 
        $match: { 
          $or: [
            { "students.studentid": studentId },
            { "students.studentid": queryId }
          ]
        } 
      },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Groups by "YYYY-MM"
          present: { $sum: { $cond: [{ $eq: ["$students.remark", "P"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$students.remark", "A"] }, 1, 0] } },
          totalDays: { $sum: 1 }
        }
      },
      { $sort: { "_id": -1 } }
    ]).toArray();

    // 3. Always return an array, even if empty, to prevent frontend crashes
    res.status(200).json({ success: true, summary: summary || [] });
  } catch (error) {
    console.error("Backend Aggregation Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error during aggregation" });
  }
};