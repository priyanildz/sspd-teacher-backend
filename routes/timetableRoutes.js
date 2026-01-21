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
        // Use a case-insensitive regex for division just in case
        const result = await Timetable.findOne({ 
            standard: standard, 
            division: division 
        });
        
        if (!result) {
            console.log(`No document found for Standard ${standard} Div ${division}`);
            return res.json([]); 
        }

        // 2. Find the specific day within the array
        // We use .find and ensure we compare trimmed, lowercase strings
        const dayData = result.timetable.find(
            d => d.day.trim().toLowerCase() === day.trim().toLowerCase()
        );

        if (!dayData) {
            console.log(`Day ${day} not found in the timetable array`);
            return res.json([]); 
        }

        // 3. Return the periods
        res.json(dayData.periods); 
    } catch (err) {
        console.error("Timetable Fetch Error:", err);
        res.status(500).json({ error: err.message });
    }
});
  

module.exports = router;
