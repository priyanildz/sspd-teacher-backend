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




const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    // Exclude venue from the results
    const events = await Event.find().select('-venue').sort({ date: 1 });
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventDetails = async (req, res) => {
  try {
    const { eventName } = req.params;
    // Populate turns student IDs into full student objects
    const event = await Event.findOne({ eventname: eventName })
      .select('-venue')
      .populate('participants');
    
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