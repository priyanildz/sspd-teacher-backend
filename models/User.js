const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contact: { type: String, required: true },
  role: { type: String, enum: ["teacher", "admin"], required: true },
  
  classAssigned: {
    type: {
      standard: { type: String, default: null }, // e.g., "5th"
      division: { type: String, default: null }, // e.g., "A"
    },
    default: null, // Ensures this is null for non-teachers
  },
});

// module.exports = mongoose.model("User", userSchema);
module.exports = mongoose.model("staff", userSchema);
