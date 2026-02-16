const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// This matches the "api/studentattendences" path used in Flutter
router.post('/studentattendences', attendanceController.addAttendance);

module.exports = router;