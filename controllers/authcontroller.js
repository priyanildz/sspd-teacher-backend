const User = require("../models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, username, password, dob, emailaddress, contact, role, standard, division } = req.body;

  try {
    // Check if user already exists by username or email
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Username or email already exists" });
    }

    // Hash password
    // const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      username,
      // password: hashedPassword,
      password: password,
      dob,
      emailaddress,
      contact,
      role,
      classAssigned: role === "teacher" ? { standard, division } : { standard: "N/A", division: "N/A" },
    });

    await newUser.save();

    res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// exports.getProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user.userId).select("-password"); // Exclude password

//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     res.status(200).json({
//       success: true,
//       user: {
//         name: user.name,
//         username: user.username,
//         dob: user.dob,
//         email: user.email,
//         contact: user.contact,
//         role: user.role,
//         classAssigned: user.classAssigned || { standard: "N/A", division: "N/A" }, // Ensure object structure
//       },
//     });
//   } catch (error) {
//     console.error("Profile Fetch Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.getProfile = async (req, res) => {
  try {
    // 1. Fetch the user from the staffs collection using ID from JWT
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2. Look up the assigned classroom
    // We search the 'classrooms' collection for a document where staffid matches this user's _id
    const classroom = await mongoose.model("classroom").findOne({ staffid: user._id });

    // 3. Format the Date of Birth
    let formattedDOB = "N/A";
    if (user.dob) {
      const dateObj = new Date(user.dob);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      formattedDOB = `${day}/${month}/${year}`;
    }

    // 4. Send the complete profile data back to Flutter
    res.status(200).json({
      success: true,
      user: {
        name: user.name || `${user.firstname} ${user.middlename} ${user.lastname}`, 
        username: user.staffid, 
        dob: formattedDOB,
        emailaddress: user.emailaddress,
        contact: user.phoneno || user.contact,
        photo: user.photo,
        role: user.role || "teacher",
        // ✅ This will now return the actual class (e.g., 1 - A) instead of N/A
        classAssigned: classroom ? { 
          standard: classroom.standard, 
          division: classroom.division 
        } : { standard: "N/A", division: "N/A" },
      },
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ staffid: username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password
    // const passwordMatch = await bcrypt.compare(password, user.password);
    // if (!passwordMatch) {
    //   return res.status(401).json({ success: false, message: "Invalid credentials" });
    // }

    // Check password (Simple text comparison)
if (password !== user.password) {
  return res.status(401).json({ success: false, message: "Invalid credentials" });
}

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name,
        username: user.username,
        dob: user.dob,
        emailaddress: user.emailaddress,
        contact: user.contact,
        role: user.role,
        classAssigned: user.classAssigned || { standard: "N/A", division: "N/A" },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
