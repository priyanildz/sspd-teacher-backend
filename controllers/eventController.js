const mongoose = require('mongoose'); // ✅ FIX: Added missing import
const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// In your backend controller
exports.getEventDetails = async (req, res) => {
  try {
    const { eventName } = req.params;
    // .populate('participants') is the key to fetching the actual student records
    const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    res.status(200).json({ 
      success: true, 
      participants: event.participants, // This will now be a list of Student objects
      eventDetails: event 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};