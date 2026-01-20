// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
//   dob: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   contact: { type: String, required: true },
//   role: { type: String, enum: ["teacher", "admin"], required: true },
  
//   classAssigned: {
//     type: {
//       standard: { type: String, default: null }, // e.g., "5th"
//       division: { type: String, default: null }, // e.g., "A"
//     },
//     default: null, // Ensures this is null for non-teachers
//   },
// });

// // module.exports = mongoose.model("User", userSchema);
// module.exports = mongoose.model("staff", userSchema);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  staffid: { type: String, required: true, unique: true },
  firstname: { type: String }, 
  middlename: { type: String },
  lastname: { type: String },
  name: { type: String },
  password: { type: String, required: true },
  dob: { type: String },
  emailaddress: { type: String }, 
  phoneno: { type: String }, 
  photo: { type: String }, // ✅ CORRECTED: This must be String to store the URL
  role: { type: String, default: "teacher" },
  classAssigned: {
    standard: { type: String, default: "N/A" },
    division: { type: String, default: "N/A" },
  }
}, { collection: 'staffs' }); 

module.exports = mongoose.model("staff", userSchema);