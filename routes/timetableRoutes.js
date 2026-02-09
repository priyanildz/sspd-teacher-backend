const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');
const mongoose = require('mongoose');

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
// }); }


// router.get('/:standard/:division/:date', async (req, res) => {
//     const { standard, division, date } = req.params;

//     try {
//         const result = await Timetable.findOne({ standard, division });

//         if (!result || !result.timetable) {
//             return res.status(200).json([]);
//         }

//         const requestedDate = new Date(date);
//         if (isNaN(requestedDate.getTime())) {
//             return res.status(200).json([]);
//         }

//         const dayName = requestedDate.toLocaleDateString("en-US", {
//             weekday: "long"
//         });

//         const dayData = result.timetable.find(
//             // d => d.day && d.day.trim().toLowerCase() === dayName.toLowerCase()
//             d => d.day.toLowerCase() === dayName.toLowerCase()
//         );

//         if (!dayData || !dayData.periods) {
//             return res.status(200).json([]);
//         }

//         res.status(200).json(dayData.periods);

//     } catch (err) {
//         console.error("Fetch Error:", err);
//         res.status(500).json([]);
//     }
// });


router.get('/:standard/:division/:date', async (req, res) => {
    const { standard, division, date } = req.params;

    try {
        const result = await Timetable.findOne({ standard, division });

        if (!result || !result.timetable) {
            return res.status(200).json([]);
        }

        const requestedDate = new Date(date);
        if (isNaN(requestedDate.getTime())) {
            return res.status(200).json([]);
        }

        const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });
        const dayData = result.timetable.find(
            d => d.day && d.day.toLowerCase().trim() === dayName.toLowerCase().trim()
        );

        if (!dayData || !dayData.periods) {
            return res.status(200).json([]);
        }

        // Fetch tests for this date
        const db = mongoose.connection.db;
        const dateString = requestedDate.toISOString().split('T')[0];

        const testsToday = await db.collection('termassessments').find({
            standard: standard,
            division: division,
            date: { $regex: `^${dateString}` }
        }).toArray();

        // ✅ DEFENSIVE MAPPING LOGIC
const updatedPeriods = dayData.periods.map(period => {
    // Ensure period exists and has a periodNumber
    const currentPeriodNum = (period && period.periodNumber) ? period.periodNumber.toString() : null;

    const hasTest = testsToday.find(t => {
        // 1. Ensure test record exists
        if (!t) return false;
        
        // 2. Safely get lecNo as a string (handling both String and Number types)
        const testLecNo = (t.lecNo !== undefined && t.lecNo !== null) ? t.lecNo.toString() : null;
        
        // 3. Compare only if both exist
        return testLecNo !== null && currentPeriodNum !== null && testLecNo === currentPeriodNum;
    });

    return {
        ...period,
        isTest: !!hasTest,
        testDetails: hasTest || null,
        // Override subject/topic if test exists, else keep original or default to "No Subject"
        subject: hasTest ? (hasTest.subject || "Test") : (period.subject || "No Subject"),
        topic: hasTest ? (hasTest.topic || "") : (period.topic || "")
    };
});

        res.status(200).json(updatedPeriods);

    } catch (err) {
        console.error("Timetable Fetch Error:", err);
        // Return empty array instead of 500 to keep the app running
        res.status(200).json([]); 
    }
});




// ✅ NEW: Get all lectures of a teacher for a given date
router.get('/teacher/:teacherId/:date', async (req, res) => {
  const { teacherId, date } = req.params;

  try {
    const requestedDate = new Date(date);
    if (isNaN(requestedDate.getTime())) {
      return res.status(200).json([]);
    }

    const dayName = requestedDate.toLocaleDateString("en-US", {
      weekday: "long"
    });

    // 1️⃣ Fetch ALL timetables
    const timetables = await Timetable.find({});

    let result = [];

    // 2️⃣ Scan each standard/division
    timetables.forEach(tt => {
      const dayData = tt.timetable.find(
        d => d.day && d.day.toLowerCase() === dayName.toLowerCase()
      );

      if (!dayData || !dayData.periods) return;

      dayData.periods.forEach(period => {
        if (
          period.teacher &&
          mongoose.Types.ObjectId(period.teacher).equals(teacherId)
        ) {
          result.push({
            standard: tt.standard,
            division: tt.division,
            periodNumber: period.periodNumber,
            subject: period.subject,
            teacher: period.teacher,
            teacherName: period.teacherName,
            time: period.time
          });
        }
      });
    });

    return res.status(200).json(result);

  } catch (err) {
    console.error("Teacher Timetable Fetch Error:", err);
    return res.status(500).json([]);
  }
});


module.exports = router;
