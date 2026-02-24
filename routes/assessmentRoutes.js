const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

// This maps the controller logic to the /create path
router.post("/create", assessmentController.createAssessment);
router.post("/check-availability", assessmentController.checkAssessmentsAvailability);
router.get("/fetch", assessmentController.getAssessment);

router.post("/submit-students", assessmentController.submitStudentStatus);
router.get("/fetch-students", assessmentController.getAssessment); // Reuse getAssessment!

module.exports = router;