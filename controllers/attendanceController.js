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

    const summary = await db.collection('studentattendences').aggregate([
      // 1. Flatten the students array so we can look at each record
      { $unwind: "$students" },
      
      // 2. Match the specific studentId as either a String or an ObjectId
      { 
        $match: { 
          $or: [
            { "students.studentid": studentId },
            { "students.studentid": new mongoose.Types.ObjectId(studentId) }
          ]
        } 
      },
      
      // 3. Group by the month (from the YYYY-MM-DD string)
      {
        $group: {
          _id: { $substr: ["$date", 0, 7] }, // Gets "2026-02"
          present: { $sum: { $cond: [{ $eq: ["$students.remark", "P"] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ["$students.remark", "A"] }, 1, 0] } },
          totalDays: { $sum: 1 }
        }
      },
      
      // 4. Sort by most recent month
      { $sort: { "_id": -1 } }
    ]).toArray();

    res.status(200).json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};