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
        
        // Change: Return empty list instead of 404
        if (!result) {
            return res.json([]); 
        }

        const dayData = result.timetable.find(
            d => d.day.toLowerCase() === day.toLowerCase()
        );

        if (!dayData) {
            return res.json([]); 
        }

        res.json(dayData.periods); 
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
  

module.exports = router;
