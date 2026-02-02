// const StaffLeave = require("../models/StaffLeave");

// exports.applyLeave = async (req, res) => {
//   try {
//     const { subject, message, from, to } = req.body;
    
//     const newLeave = new StaffLeave({
//       staffid: req.user.userId, // Taken from the JWT token
//       subject,
//       message,
//       from,
//       to
//     });

//     await newLeave.save();
//     res.status(201).json({ success: true, message: "Leave request submitted successfully" });
//   } catch (error) {
//     console.error("Leave Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// exports.getMyLeaves = async (req, res) => {
//   try {
//     // Fetch only the leaves for the logged-in teacher
//     const leaves = await StaffLeave.find({ staffid: req.user.userId }).sort({ submitted_at: -1 });
//     res.status(200).json({ success: true, leaves });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };


const User = require("../models/User"); // Reference to your staffs collection
const StaffLeave = require("../models/StaffLeave");

exports.applyLeave = async (req, res) => {
  try {
    const { subject, message, from, to } = req.body;
    
    // 1. Fetch the teacher's full details first
    const teacher = await User.findById(req.user.userId);
    
    const newLeave = new StaffLeave({
      staffid: req.user.userId,
      // ✅ Add these if the admin schema allows, or ensure the admin API populates them
      name: teacher.name || `${teacher.firstname} ${teacher.lastname}`, 
      subject,
      message,
      from,
      to,
      status: "pending"
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: "Leave request sent!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};