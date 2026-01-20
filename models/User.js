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
  staffid: { type: String, required: true, unique: true }, // Matches image_311c8f.png
  firstname: { type: String }, 
  middlename: { type: String },
  lastname: { type: String },
  name: { type: String }, // You can keep this for compatibility
  password: { type: String, required: true },
  dob: { type: String },
  emailaddress: { type: String, unique: true },
  photo: { type: String },
  phoneno: { type: String }, // Matches 'phoneno' in image_311c8f.png
  role: { type: String, default: "teacher" },
  classAssigned: {
    standard: { type: String, default: "N/A" },
    division: { type: String, default: "N/A" },
  }
}, { collection: 'staffs' }); // Explicitly tell it to use the 'staffs' collection

module.exports = mongoose.model("staff", userSchema);