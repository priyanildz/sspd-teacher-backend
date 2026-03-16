const express = require("express");
const router = express.Router();
const { register, login, getProfile, getMasterSubjectsByStandard, getTeacherAssignmentOptions } = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware to verify JWT

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile); // ✅ Add Profile Route
router.get("/standards/subjects/:standard", getMasterSubjectsByStandard);
router.get("/teacher-assignment-options", authMiddleware, getTeacherAssignmentOptions);

module.exports = router;
