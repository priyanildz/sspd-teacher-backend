const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/authMiddleware");

// Points to the existing admin collection
const StaffLeave = mongoose.model("staff_leave"); 

// ✅ Route: Apply for Leave
router.post("/apply", authMiddleware, async (req, res) => {
  try {
    const { subject, message, from, to } = req.body;
    
    // Create leave matching admin schema
    const newLeave = new StaffLeave({
      staffid: req.user.userId, // From JWT
      subject,
      message,
      from, // e.g., "2026-02-01"
      to,   // e.g., "2026-02-05"
      status: "pending"
    });

    await newLeave.save();
    res.status(201).json({ success: true, message: "Leave request sent!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Route: Get My Leaves
router.get("/my-leaves", authMiddleware, async (req, res) => {
  try {
    const leaves = await StaffLeave.find({ staffid: req.user.userId }).sort({ submitted_at: -1 });
    res.status(200).json({ success: true, leaves });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;