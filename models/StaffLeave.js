const mongoose = require("mongoose");

const staffLeaveSchema = new mongoose.Schema({
  staffid: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" }, // Connected to your User model
  subject: { type: String, lowercase: true },
  message: { type: String, lowercase: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    lowercase: true,
    default: "pending",
  },
  submitted_at: { type: Date, default: Date.now },
  from: { type: String }, // Format: YYYY-MM-DD
  to: { type: String },
});

// Important: "staff_leave" matches the collection name in admin
module.exports = mongoose.model("staff_leave", staffLeaveSchema);