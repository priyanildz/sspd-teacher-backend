const express = require("express");
const router = express.Router();
const { register, login, getProfile, getMasterSubjectsByStandard, getStudentsByClass,   // <--- Add this
  saveExamResult,      // <--- Add this
  getExamMarks } = require("../controllers/authcontroller");
const authMiddleware = require("../middleware/authMiddleware"); // Middleware to verify JWT

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile); // ✅ Add Profile Route
router.get("/standards/subjects/:standard", getMasterSubjectsByStandard);

router.get("/students", authMiddleware, getStudentsByClass); 
router.get("/examresults", authMiddleware, getExamMarks);

module.exports = router;
