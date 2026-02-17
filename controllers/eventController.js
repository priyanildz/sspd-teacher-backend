// controllers/eventController.js
const mongoose = require('mongoose'); // ✅ FIX: Prevents ReferenceError: mongoose is not defined
const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventDetails = async (req, res) => { // ✅ This name MUST match the route
  try {
    const { eventName } = req.params;
    // .populate('participants') swaps student IDs for real student objects
    const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    res.status(200).json({ 
      success: true, 
      participants: event.participants, // This returns real student data
      eventDetails: event 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};