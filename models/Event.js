// // models/Event.js

// const mongoose = require("mongoose");

// const eventSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   date: { type: String, required: true },
//   venue: { type: String, required: true },
//   managedBy: { type: String, required: true },
// });

// module.exports = mongoose.model("Event", eventSchema);


const eventSchema = new mongoose.Schema({
  eventname: { type: String, required: true },
  date: { type: Date, required: true },
  managedby: { type: String, required: true },
  standard: { type: String, required: true },
  division: { type: String, required: true },
  // venue: { type: String, required: true }, // REMOVED
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });