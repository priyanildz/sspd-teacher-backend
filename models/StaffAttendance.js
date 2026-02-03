const mongoose = require("mongoose");

const StaffAttendanceSchema = new mongoose.Schema({
    staffid: { type: String, required: true },
    date: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Present', 'Leave', 'Holiday'] },
    checkInTime: { type: String, default: null },
    checkOutTime: { type: String, default: null },
}, { collection: 'staffattendances' }); // ✅ Forces it to use the exact collection name

module.exports = mongoose.model("StaffAttendance", StaffAttendanceSchema);