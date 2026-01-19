const express = require("express");
const router = express.Router();
const MySubject = require("../models/MySubject");

// ✅ Add or Update Subjects for a User (No Authentication Required)
router.post("/add-my-subjects", async (req, res) => {
    try {
        const { user_id, subjects } = req.body;

        // 🔹 Validate required fields
        if (!user_id || !Array.isArray(subjects) || subjects.length === 0) {
            return res.status(400).json({ success: false, message: "User ID and subjects (array) are required" });
        }

        // 🔹 Check if subjects exist for the user
        let existingRecord = await MySubject.findOne({ user_id });

        if (existingRecord) {
            // ✅ Append new subjects to the existing array
            existingRecord.subjects.push(...subjects);
            await existingRecord.save();
            return res.status(200).json({ success: true, message: "Subjects updated successfully", data: existingRecord });
        }
        

        // ✅ Create a new subject entry if it doesn't exist
        const newSubjectEntry = new MySubject({ user_id, subjects });
        await newSubjectEntry.save();
        res.status(201).json({ success: true, message: "Subjects added successfully", data: newSubjectEntry });

    } catch (error) {
        console.error("Error adding/updating subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
});



// ✅ Define Route for Fetching Subjects
router.get("/", async (req, res) => {
    try {
        const { user_id } = req.query; // ✅ Correctly use user_id

        if (!user_id) { // ✅ Check for user_id instead of teacherId
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const subjects = await MySubject.find({ user_id }); // ✅ Search by user_id

        if (!subjects.length) {
            return res.status(404).json({ success: false, message: "No subjects found" });
        }

        res.status(200).json({ success: true, subjects });

    } catch (error) {
        console.error("Error fetching subjects:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});


module.exports = router;


