const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');

router.post('/upload', async (req, res) => {
  try {
    const { standard, division, timetable } = req.body;

    const existing = await Timetable.findOne({ standard, division });
    if (existing) await Timetable.deleteOne({ standard, division });

    const newTimetable = new Timetable({ standard, division, timetable });
    await newTimetable.save();

    res.status(201).json({ message: "Timetable uploaded successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:standard/:division/:day', async (req, res) => {
    const { standard, division, day } = req.params;
    try {
      const result = await Timetable.findOne({ standard, division });
      if (!result) return res.status(404).json({ message: "Timetable not found" });
  
      const dayTimetable = result.timetable.find(d => d.day === day);
      if (!dayTimetable) return res.status(404).json({ message: "No timetable for this day" });
  
      res.json(dayTimetable.entries);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  

module.exports = router;
