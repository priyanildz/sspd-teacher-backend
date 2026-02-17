const Event = require('../models/Event');
const mongoose = require('mongoose');

// Fetch all events with basic info
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch specific event details with full student data
exports.getEventDetails = async (req, res) => {
  try {
    const { eventName } = req.params;
    // Population is key for real data
    const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    res.status(200).json({ 
      success: true, 
      participants: event.participants, // This is now real student data
      eventDetails: event 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};