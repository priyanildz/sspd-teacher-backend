const express = require("express");
const router = express.Router();
const SyllabusProgress = require("../models/SyllabusProgress");

// Save progress
router.post("/save", async (req, res) => {
  try {
    const { teacherId, subject, standard, semester, progressData } = req.body;
    const result = await SyllabusProgress.findOneAndUpdate(
      { teacherId, subject, standard, semester },
      { progressData },
      { ups: true, new: true }
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get progress
router.get("/fetch", async (req, res) => {
  try {
    const { teacherId, subject, standard, semester } = req.query;
    const progress = await SyllabusProgress.findOne({ teacherId, subject, standard, semester });
    res.status(200).json({ success: true, data: progress ? progress.progressData : {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;