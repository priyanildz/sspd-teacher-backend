const StaffLeave = require("../models/StaffLeave");

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

exports.applyLeave = async (req, res) => {
  try {
    const { subject, message, from, to } = req.body;
    
    const newLeave = new StaffLeave({
      // ✅ CHANGE THIS: Use the readable staffid (like 'STF-123') instead of the userId (_id)
      // This matches the key the Admin portal uses to lookup names/departments
      staffid: req.user.username, 
      subject,
      message,
      from,
      to
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: "Leave request submitted successfully" });
  } catch (error) {
    console.error("Leave Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// exports.getMyLeaves = async (req, res) => {
//   try {
//     // Fetch only the leaves for the logged-in teacher
//     const leaves = await StaffLeave.find({ staffid: req.user.userId }).sort({ submitted_at: -1 });
//     res.status(200).json({ success: true, leaves });
//   } catch (error) {
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.getMyLeaves = async (req, res) => {
  try {
    // ✅ CHANGE: Use req.user.username to match how you now save leaves
    const leaves = await StaffLeave.find({ staffid: req.user.username }).sort({ submitted_at: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};