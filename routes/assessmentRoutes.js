const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Assessment = require('../models/Assessment'); // Ensure this model exists

router.post('/create', async (req, res) => {
    try {
        const { teacherId, classroomId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date } = req.body;

        const newAssessment = new Assessment({
            teacherId: new mongoose.Types.ObjectId(teacherId),
            classroomId: new mongoose.Types.ObjectId(classroomId),
            subjectCovered,
            topicCovered,
            keyPoints,
            classActivity,
            homework,
            date: new Date(date)
        });

        await newAssessment.save();
        res.status(201).json({ success: true, message: "Assessment created successfully" });
    } catch (err) {
        console.error("Creation Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;