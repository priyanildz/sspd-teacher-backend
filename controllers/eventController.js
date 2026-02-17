// controllers/eventController.js
const mongoose = require('mongoose'); // Required for population and objectId handling
const Event = require('../models/Event');

// Fetch all events
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch real participants using populate
exports.getEventDetails = async (req, res) => {
  try {
    const { eventName } = req.params;
    
    // .populate('participants') turns student IDs into real student data objects
    const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    
    res.status(200).json({ 
      success: true, 
      participants: event.participants, 
      eventDetails: event 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};