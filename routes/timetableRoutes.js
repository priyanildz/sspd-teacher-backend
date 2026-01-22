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

// router.get('/:standard/:division/:day', async (req, res) => {
//     const { standard, division, day } = req.params;
//     try {
//         // 1. Find the timetable document
//         const result = await Timetable.findOne({ standard, division });
        
//         // If no document exists for this class, return empty array
//         if (!result || !result.timetable) {
//             return res.status(200).json([]); 
//         }

//         // 2. Find the specific day
//         // We use trim() and toLowerCase() to ensure "Wednesday" matches "Wednesday"
//         const dayData = result.timetable.find(
//             d => d.day && d.day.trim().toLowerCase() === day.trim().toLowerCase()
//         );

//         // 3. Return the periods or an empty array
//         // This ensures the Flutter app always receives valid JSON like []
//         if (!dayData || !dayData.periods) {
//             return res.status(200).json([]); 
//         }

//         res.status(200).json(dayData.periods); 
//     } catch (err) {
//         console.error("Timetable Fetch Error:", err);
//         // Even on error, return an empty array to prevent Flutter crash
//         res.status(500).json([]); 
//     }
// });
router.get('/:standard/:division/:day', async (req, res) => {
    const { standard, division, day } = req.params;
    try {
        // Query using strings to match the "1" and "A" seen in your Atlas screenshot
        const result = await Timetable.findOne({ 
            standard: standard.toString(), 
            division: division.toString() 
        });
        
        if (!result || !result.timetable) {
            console.log("No document found for standard:", standard);
            return res.status(200).json([]); 
        }

        // Find the day inside the nested array
        const dayData = result.timetable.find(
            d => d.day && d.day.trim().toLowerCase() === day.trim().toLowerCase()
        );

        if (!dayData || !dayData.periods) {
            console.log("No day data found for:", day);
            return res.status(200).json([]); 
        }

        res.status(200).json(dayData.periods); 
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json([]); 
    }
});


module.exports = router;
