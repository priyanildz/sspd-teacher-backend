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
        // 1. Find the timetable document for the specific class
        const result = await Timetable.findOne({ standard, division });
        
        if (!result) {
            return res.status(404).json({ message: "Timetable not found for this class" });
        }

        // 2. Find the specific day object within the timetable array (e.g., "Monday")
        const dayData = result.timetable.find(
            d => d.day.toLowerCase() === day.toLowerCase()
        );

        if (!dayData) {
            return res.status(404).json({ message: `No timetable found for ${day}` });
        }

        // 3. Return the periods array as expected by the Flutter app
        // Based on your JSON, this contains subject, teacherName, and time
        res.json(dayData.periods); 
    } catch (err) {
        console.error("Timetable Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});
  

module.exports = router;
