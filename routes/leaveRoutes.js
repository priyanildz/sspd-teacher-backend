const express = require("express");
const router = express.Router();
const { applyLeave, getMyLeaves } = require("../controllers/leaveController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/apply", authMiddleware, applyLeave);
router.get("/my-leaves", authMiddleware, getMyLeaves);

module.exports = router;