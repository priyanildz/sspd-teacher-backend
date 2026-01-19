const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, username, password, dob, email, contact, role, standard, division } = req.body;

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
      email,
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
    // We use the ID extracted from the JWT token
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name || user.firstname, // Fallback if name isn't set but firstname is
        username: user.staffid, // Use staffid as the display username
        dob: user.dob,
        emailaddress: user.emailaddress,
        contact: user.phoneno || user.contact, // Database uses 'phoneno'
        role: user.role || "teacher",
        classAssigned: user.classAssigned || { standard: "N/A", division: "N/A" },
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
        email: user.email,
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
