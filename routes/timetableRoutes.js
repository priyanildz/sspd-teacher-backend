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
            console.log(`No timetable document found for Standard: ${standard}, Division: ${division}`);
            return res.json([]); 
        }

        // 2. Find the specific day object (e.g., "Wednesday") 
        // Using a case-insensitive match to be safe
        const dayData = result.timetable.find(
            d => d.day.trim().toLowerCase() === day.trim().toLowerCase()
        );

        if (!dayData) {
            console.log(`No data found in array for day: ${day}`);
            return res.json([]); 
        }

        // 3. Return the periods array
        // Based on your JSON, dayData.periods is the correct array
        res.json(dayData.periods); 
    } catch (err) {
        console.error("Timetable Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});
  

module.exports = router;
