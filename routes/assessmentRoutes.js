const express = require("express");
const router = express.Router();
const assessmentController = require("../controllers/assessmentController");

// This maps the controller logic to the /create path
router.post("/create", assessmentController.createAssessment);
router.get("/fetch", assessmentController.getAssessment);

module.exports = router;