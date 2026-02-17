const Event = require('../models/Event');

exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findById(id).populate('participants');
    if (!event) return res.status(404).json({ success: false, message: "Event not found" });
    res.status(200).json({ success: true, participants: event.participants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};