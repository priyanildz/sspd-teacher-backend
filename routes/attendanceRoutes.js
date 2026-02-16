const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// This matches POST /api/teachers/studentattendences
router.get('/studentattendences/:std/:div/:date', attendanceController.getAttendanceByDate);
router.post('/studentattendences', attendanceController.addAttendance);

module.exports = router;