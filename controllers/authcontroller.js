const User = require("../models/User");
const Classroom = require("../models/Classroom");
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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Look for classroom assignment by the teacher's staffid (e.g., STF-PR-1-8309)
    const classroom = await mongoose.model("classroom").findOne({ staffid: user.staffid });

    let formattedDOB = "N/A";
    if (user.dob) {
      const dateObj = new Date(user.dob);
      formattedDOB = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    }

    res.status(200).json({
      success: true,
      user: {
        name: user.name || `${user.firstname} ${user.middlename} ${user.lastname}`, 
        username: user.staffid, 
        dob: formattedDOB,
        emailaddress: user.emailaddress,
        contact: user.phoneno || user.contact,
        photo: user.photo, // ✅ MUST send this for Flutter image to work
        role: user.role || "teacher",
        classAssigned: classroom ? { 
          standard: classroom.standard, 
          division: classroom.division 
        } : { standard: "Not Assigned", division: "" }
      },
    });
  } catch (error) {
    console.error("Profile Error:", error);
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
