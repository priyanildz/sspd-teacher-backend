// const mongoose = require('mongoose'); // ✅ FIX: Added missing import
// const Event = require('../models/Event');

// exports.getEvents = async (req, res) => {
//   try {
//     const events = await Event.find().sort({ date: 1 });
//     res.status(200).json({ success: true, events });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// exports.getEventDetails = async (req, res) => {
//   try {
//     const { eventName } = req.params;
//     // ✅ Use populate to get real student names from the participants array
//     const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
//     if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
//     res.status(200).json({ 
//       success: true, 
//       participants: event.participants, // Now contains full student objects
//       eventDetails: event 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };







// const Event = require('../models/Event');

// exports.getEvents = async (req, res) => {
//   try {
//     const events = await Event.find().select('-venue').sort({ date: 1 }); // Exclude venue
//     res.status(200).json({ success: true, events });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// exports.getEventDetails = async (req, res) => {
//   try {
//     const { eventName } = req.params;
//     // Populate turns the Array of IDs into full Student objects
//     const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
//     if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
//     res.status(200).json({ 
//       success: true, 
//       participants: event.participants, // Now contains full student data
//       eventDetails: event 
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };




const Event = require('../models/Event');
const Student = require('../models/Student'); // ✅ Added to fix 500 error during populate

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find().select('-venue').sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const { eventName } = req.params;
    // population works now because the ref name matches Student.js
    const event = await Event.findOne({ eventname: eventName }).populate('participants');
    
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    
    res.status(200).json({ 
      success: true, 
      participants: event.participants, 
      eventDetails: event 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};