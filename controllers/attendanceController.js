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
    const db = mongoose.connection.db;

    // Aggregate attendance records for the specific student
    const summary = await db.collection('studentattendences').aggregate([
      { $unwind: "$students" },
      { $match: { "students.studentid": studentId } },
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Groups by YYYY-MM
          present: {
            $sum: { $cond: [{ $eq: ["$students.remark", "P"] }, 1, 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$students.remark", "A"] }, 1, 0] }
          },
          totalDays: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};