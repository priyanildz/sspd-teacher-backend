// // models/Event.js

// const mongoose = require("mongoose");

// const eventSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   date: { type: String, required: true },
//   venue: { type: String, required: true },
//   managedBy: { type: String, required: true },
// });

// module.exports = mongoose.model("Event", eventSchema);



// const mongoose = require('mongoose'); // Add this missing import

// const eventSchema = new mongoose.Schema({
//   eventname: { type: String, required: true },
//   date: { type: Date, required: true },
//   managedby: { type: String, required: true },
//   standard: { type: String, required: true },
//   division: { type: String, required: true },
//   // venue: { type: String, required: true }, // Removed as requested
//   participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
// }, { timestamps: true });

// module.exports = mongoose.model('Event', eventSchema);



const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  eventname: { type: String, required: true },
  date: { type: Date, required: true },
  managedby: { type: String, required: true },
  standard: { type: String, required: true },
  division: { type: String, required: true },
  // FIX: Match the lowercase name used in Student.js export
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'student' }] 
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);