// const express = require("express");
// const router = express.Router();
// const MySubject = require("../models/MySubject");

// // ✅ Add or Update Subjects for a User (No Authentication Required)
// router.post("/add-my-subjects", async (req, res) => {
//     try {
//         const { user_id, subjects } = req.body;

//         // 🔹 Validate required fields
//         if (!user_id || !Array.isArray(subjects) || subjects.length === 0) {
//             return res.status(400).json({ success: false, message: "User ID and subjects (array) are required" });
//         }

//         // 🔹 Check if subjects exist for the user
//         let existingRecord = await MySubject.findOne({ user_id });

//         if (existingRecord) {
//             // ✅ Append new subjects to the existing array
//             existingRecord.subjects.push(...subjects);
//             await existingRecord.save();
//             return res.status(200).json({ success: true, message: "Subjects updated successfully", data: existingRecord });
//         }
        

//         // ✅ Create a new subject entry if it doesn't exist
//         const newSubjectEntry = new MySubject({ user_id, subjects });
//         await newSubjectEntry.save();
//         res.status(201).json({ success: true, message: "Subjects added successfully", data: newSubjectEntry });

//     } catch (error) {
//         console.error("Error adding/updating subjects:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
//     }
// });



// // ✅ Define Route for Fetching Subjects
// router.get("/", async (req, res) => {
//     try {
//         const { user_id } = req.query; // ✅ Correctly use user_id

//         if (!user_id) { // ✅ Check for user_id instead of teacherId
//             return res.status(400).json({ success: false, message: "User ID is required" });
//         }

//         const subjects = await MySubject.find({ user_id }); // ✅ Search by user_id

//         if (!subjects.length) {
//             return res.status(404).json({ success: false, message: "No subjects found" });
//         }

//         res.status(200).json({ success: true, subjects });

//     } catch (error) {
//         console.error("Error fetching subjects:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });


// module.exports = router;



const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const MySubject = require("../models/MySubject");

// ✅ Add or Update Subjects (Existing logic preserved)
router.post("/add-my-subjects", async (req, res) => {
    try {
        const { user_id, subjects } = req.body;
        if (!user_id || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ success: false, message: "User ID and subjects (array) are required" });
        }
        let existingRecord = await MySubject.findOne({ user_id });
        if (existingRecord) {
            existingRecord.subjects.push(...subjects);
            await existingRecord.save();
            return res.status(200).json({ success: true, message: "Subjects updated successfully", data: existingRecord });
        }
        const newSubjectEntry = new MySubject({ user_id, subjects });
        await newSubjectEntry.save();
        res.status(201).json({ success: true, message: "Subjects added successfully", data: newSubjectEntry });
    } catch (error) {
        console.error("Error adding/updating subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});

// ✅ GET Route: Updated to fetch and format data from 'subjectallocations'
// router.get("/", async (req, res) => {
//     try {
//         const { user_id } = req.query;

//         if (!user_id) {
//             return res.status(400).json({ success: false, message: "User ID is required" });
//         }

//         // 1. Ensure we are looking at the 'subjectallocations' collection
//         // Use your existing MySubject model or point to the collection shown in your image
//         const allocation = await mongoose.connection.collection("subjectallocations").findOne({ 
//             teacher: new mongoose.Types.ObjectId(user_id) 
//         });

//         if (!allocation) {
//             return res.status(200).json({ success: true, subjects: [] });
//         }

//         // 2. Format the data for Flutter
//         // Your Flutter code expects: { "subject_name": "...", "standard": "...", "division": "..." }
//         // We "zip" the arrays from your DB screenshot into a single list
//         const formattedSubjects = (allocation.subjects || []).map((subj, index) => {
//             return {
//                 subject_name: subj,
//                 standard: (allocation.standards && allocation.standards[index]) ? allocation.standards[index] : "N/A",
//                 // Joins the divisions array (A, B, C, D, E) into one string for the table
//                 division: Array.isArray(allocation.divisions) ? allocation.divisions.join(", ") : "-"
//             };
//         });

//         res.status(200).json({ 
//             success: true, 
//             subjects: formattedSubjects 
//         });

//     } catch (error) {
//         console.error("Error fetching subjects:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });

// ✅ Corrected GET Route in mySubjectRoutes.js
router.get("/", async (req, res) => {
    try {
        const { user_id } = req.query;

        if (!user_id) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const allocation = await mongoose.connection.collection("subjectallocations").findOne({ 
            teacher: new mongoose.Types.ObjectId(user_id) 
        });

        if (!allocation) {
            return res.status(200).json({ success: true, subjects: [] });
        }

        const formattedSubjects = [];

        // ✅ FLATTENING LOGIC: Loop through subjects and create separate entries for each division
        (allocation.subjects || []).forEach((subj, index) => {
            const std = (allocation.standards && allocation.standards[index]) ? allocation.standards[index] : "N/A";
            const divisions = allocation.divisions || [];

            // Instead of joining with ", ", we push each division as a separate object
            divisions.forEach(div => {
                formattedSubjects.push({
                    subject_name: subj,
                    standard: std,
                    division: div // Now returns "A", then "B", then "C", etc.
                });
            });
        });

        res.status(200).json({ 
            success: true, 
            subjects: formattedSubjects 
        });

    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

router.get("/active-classes", async (req, res) => {
    try {
        const { user_id, date } = req.query;

        if (!user_id || !date) {
            return res.status(400).json({ success: false, message: "User ID and Date are required" });
        }

        const requestedDate = new Date(date);
        const dayName = requestedDate.toLocaleDateString("en-US", { weekday: "long" });

        // 1. Fetch ALL timetables directly from the 'timetables' collection
        // This ensures we only see classes that actually have a schedule document
        const allTimetables = await mongoose.connection.collection("timetables").find({}).toArray();

        let activeStds = new Set();
        let activeDivs = new Set();

        // 2. Filter timetables where this teacher has a period on this specific day
        allTimetables.forEach(tt => {
            const dayData = tt.timetable.find(
                d => d.day && d.day.toLowerCase() === dayName.toLowerCase()
            );

            if (dayData && dayData.periods) {
                // Check if any period matches the teacher's ID
                const hasLecture = dayData.periods.some(period => 
                    period.teacher && period.teacher.toString() === user_id
                );

                if (hasLecture) {
                    activeStds.add(tt.standard.toString());
                    activeDivs.add(tt.division.toString());
                }
            }
        });

        res.status(200).json({ 
            success: true, 
            stds: Array.from(activeStds).sort(),
            divs: Array.from(activeDivs).sort() // ✅ Will return only A, B, C, D
        });

    } catch (error) {
        console.error("Error fetching active classes:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

module.exports = router;