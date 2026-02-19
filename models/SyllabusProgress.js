const mongoose = require("mongoose");

const SyllabusProgressSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "staff", required: true },
  subject: { type: String, required: true },
  standard: { type: String, required: true },
  semester: { type: String, required: true },
  // This stores the key-value pairs from your Flutter tableData map
  // e.g., {"Chp 1-A": "Completed", "Chp 2-B": "Pending"}
  progressData: { type: Map, of: String, default: {} }
}, { timestamps: true });

module.exports = mongoose.model("SyllabusProgress", SyllabusProgressSchema);