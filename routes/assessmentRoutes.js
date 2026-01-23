const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment'); 

router.post('/create', async (req, res) => {
    try {
        const { teacherId, classroomId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date } = req.body;

        // ✅ Check if IDs are valid before trying to convert them
        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ success: false, message: "Invalid Teacher ID" });
        }

        const newAssessment = new Assessment({
            teacherId: new mongoose.Types.ObjectId(teacherId),
            // ✅ Only convert classroomId if it is provided and valid
            classroomId: classroomId && mongoose.Types.ObjectId.isValid(classroomId) 
                         ? new mongoose.Types.ObjectId(classroomId) 
                         : null,
            subjectCovered,
            topicCovered,
            keyPoints,
            classActivity,
            homework,
            date: date ? new Date(date) : new Date()
        });

        await newAssessment.save();
        res.status(201).json({ success: true, message: "Assessment created successfully" });
    } catch (err) {
        console.error("Creation Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;