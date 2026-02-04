const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authcontroller = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/authMiddleware");

// 🔍 GET all teachers except the current logged-in teacher
router.get("/", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    const teachers = await User.find({
      _id: { $ne: currentUserId },
      role: "teacher"
    }).select("_id name email");

    res.json({ success: true, teachers });
  } catch (error) {
    console.error("Fetch Teachers Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch teachers" });
  }
});

router.get("/my-attendance", authMiddleware, authcontroller.getStaffAttendance);

// Add this to routes/teacherRoutes.js
router.get("/exams/:standard", authMiddleware, authcontroller.getExamsByStandard);

module.exports = router;