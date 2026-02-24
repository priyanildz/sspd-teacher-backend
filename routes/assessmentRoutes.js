const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

// This maps the controller logic to the /create path
router.post("/create", assessmentController.createAssessment);
router.post("/check-availability", assessmentController.checkAssessmentsAvailability);
router.get("/fetch", assessmentController.getAssessment);

// --- NEW ROUTES FOR STUDENT SUBMISSIONS ---
router.post("/submit-students", assessmentController.submitStudentStatus);
router.get("/fetch-students", assessmentController.getStudentSubmissions);

module.exports = router;