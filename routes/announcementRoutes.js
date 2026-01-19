const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement.js');
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require("jsonwebtoken");


const extractNumber = (standardStr) => {
  return standardStr?.match(/\d+/)?.[0] || "";
};

const numberToRoman = (num) => {
  const romanMap = {
    "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V",
    "6": "VI", "7": "VII", "8": "VIII", "9": "IX", "10": "X"
  };
  return romanMap[num] || "";
};

// POST: Create a new announcement (protected route)
router.post('/add-announcement', authMiddleware, async (req, res) => {
  try {
    const { std, className, publishTo, subject, message, status } = req.body;

    const newAnnouncement = new Announcement({
      std,
      className,
      publishTo,
      subject,
      message,
      status,
      senderId: req.user.userId, // Make sure this matches your JWT payload
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    console.error("Error saving announcement:", err);
    res.status(400).json({ error: err.message });
  }
});

// GET: Get all announcements, with optional status filter
router.get('/get-announcement', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }
  
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.userId;
      const { status, std, className } = req.query;
  
      let filter = {};
  
      if (status === "sent") {
        filter.senderId = userId; // Only what the user sent
      } else if (status === "inbox") {
        if (!std || !className) {
          return res.status(400).json({ error: "Missing std or className for inbox filter" });
        }
        filter = {
          std: std,
          className: className,
          status: "sent" // Only show already-sent announcements
        };
      }
  
      const announcements = await Announcement.find(filter)
        .sort({ date: -1 })
        .populate('senderId', 'name email');
  
      res.json(announcements);
    } catch (e) {
      console.error("Failed to load announcements:", e);
      res.status(500).json({ error: "Server error" });
    }
  });
  

module.exports = router;
