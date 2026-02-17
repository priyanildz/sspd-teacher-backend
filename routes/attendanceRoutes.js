const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

router.post('/studentattendences', attendanceController.addAttendance);
router.get('/studentattendences/:std/:div/:date', attendanceController.getAttendanceByDate);
router.get('/student-summary/:studentId', attendanceController.getStudentMonthlySummary);

module.exports = router;