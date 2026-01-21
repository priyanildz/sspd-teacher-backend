const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const MySubject = require("../models/MySubject");
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
    // 1. Ensure the 'classroom' model is registered before using it
    if (!mongoose.models.classroom) {
      mongoose.model("classroom", new mongoose.Schema({
        standard: String,
        division: String,
        staffid: mongoose.Schema.Types.ObjectId
      }), "classrooms"); // Points exactly to the 'classrooms' collection
    }

    // 2. Fetch user from 'staffs' collection
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3. Look up assigned class using the teacher's unique _id
    const classroom = await mongoose.model("classroom").findOne({ staffid: user._id });

    // 4. Format Date
    let formattedDOB = "N/A";
    if (user.dob) {
      const dateObj = new Date(user.dob);
      formattedDOB = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth() + 1).padStart(2, '0')}/${dateObj.getFullYear()}`;
    }

    // 5. Send data to Flutter
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
        // ✅ Returns the Admin's classroom data (e.g., "1 - A")
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
      user: {name: user.name || `${user.firstname} ${user.middlename} ${user.lastname}`,
    username: user.staffid,
        dob: user.dob,
        emailaddress: user.emailaddress,
        contact: user.contact,
        photo: user.photo,
        role: user.role,
        classAssigned: user.classAssigned || { standard: "N/A", division: "N/A" },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getMySubjects = async (req, res) => {
  try {
    // 1. Get the Admin DB connection (Assuming it's defined in your db config)
    // If you don't have a separate connection variable, Mongoose uses the default one.
    // Ensure your .env MONGO_URI points to the cluster where 'subjectallocations' exists.

    // 2. Register Admin's model dynamically with correct types if not exists
    if (!mongoose.models.subjectallocation) {
      mongoose.model("subjectallocation", new mongoose.Schema({
        teacher: mongoose.Schema.Types.ObjectId, // ✅ Must be ObjectId
        subjects: [String],
        standards: [String],
        divisions: [String]
      }), "subjectallocations"); // ✅ Explicit collection name
    }

    // 3. Convert string ID from JWT to ObjectId for matching
    const teacherId = new mongoose.Types.ObjectId(req.user.userId);

    const allocation = await mongoose.model("subjectallocation").findOne({ 
      teacher: teacherId 
    });

    if (!allocation) {
      return res.status(200).json({ success: false, message: "No subjects found" });
    }

    // 4. Map the Admin arrays (Subjects, Standards, Divisions) into a list for Flutter
    const formattedSubjects = allocation.subjects.map((sub, index) => ({
      subject_name: sub,
      standard: allocation.standards[index] || "N/A",
      // Join divisions array into a readable string like "A, B, C"
      division: Array.isArray(allocation.divisions) ? allocation.divisions.join(", ") : allocation.divisions
    }));

    res.status(200).json({
      success: true,
      subjects: formattedSubjects
    });
  } catch (error) {
    console.error("Subject Fetch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};