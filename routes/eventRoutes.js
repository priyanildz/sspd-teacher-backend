const express = require("express");
const Event = require("../models/Event");

const router = express.Router();

// ✅ Create a new event (Emit to WebSocket)
router.post("/add", async (req, res) => {
  try {
    const { name, date, venue, managedBy } = req.body;

    if (!managedBy) {
      return res.status(400).json({ success: false, message: "Managed By is required" });
    }

    const newEvent = new Event({ name, date, venue, managedBy });
    await newEvent.save();

    // ✅ Emit event using `req.io`
    req.io.emit("new_event", { message: `New Event: ${newEvent.name}` });
console.log("Event emitted:", newEvent.name); // ✅ Add this log

    

    res.status(201).json({ success: true, message: "Event added successfully" });
  } catch (error) {
    console.error("Event Creation Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
  console.log("req.io:", req.io); // Debugging line to check if io is available

});

// ✅ Get all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find();
    res.json({ success: true, events });
  } catch (error) {
    console.error("Fetch Events Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
