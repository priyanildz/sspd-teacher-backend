const User = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const StaffAttendance = require("../models/StaffAttendance"); 

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

// exports.login = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     // Find user in database
//     const user = await User.findOne({ staffid: username });
//     if (!user) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     // Check password
//     // const passwordMatch = await bcrypt.compare(password, user.password);
//     // if (!passwordMatch) {
//     //   return res.status(401).json({ success: false, message: "Invalid credentials" });
//     // }

//     // Check password (Simple text comparison)
//     if (password !== user.password) {
//       return res.status(401).json({ success: false, message: "Invalid credentials" });
//     }

//     // Generate JWT Token
//     const token = jwt.sign(
//       { userId: user._id, role: user.role },
//       process.env.JWT_SECRET || "defaultsecret",
//       { expiresIn: "1h" }
//     );

//     // Send response
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         name: user.name || `${user.firstname} ${user.middlename} ${user.lastname}`,
//         username: user.staffid,
//         dob: user.dob,
//         emailaddress: user.emailaddress,
//         contact: user.contact,
//         photo: user.photo,
//         role: user.role,
//         classAssigned: user.classAssigned || { standard: "N/A", division: "N/A" },
//       },
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user in database
    const user = await User.findOne({ staffid: username });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Check password (Simple text comparison)
    if (password !== user.password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // ✅ Access the classrooms collection directly to get assignment and student count
    const classroom = await mongoose.connection.db.collection('classrooms').findOne({ 
      staffid: user._id 
    });

    // Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, 
        username: user.staffid,
        role: user.role },
      process.env.JWT_SECRET || "defaultsecret",
      { expiresIn: "1h" }
    );

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        name: user.name || `${user.firstname} ${user.middlename} ${user.lastname}`,
        username: user.staffid,
        dob: user.dob,
        emailaddress: user.emailaddress,
        contact: user.contact,
        photo: user.photo,
        role: user.role,
        // ✅ Populated from the classrooms collection lookup
        classAssigned: classroom ? {
          standard: classroom.standard,
          division: classroom.division,
          studentcount: classroom.studentcount || 0
        } : { standard: "N/A", division: "N/A", studentcount: 0 },
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// exports.getMySubjects = async (req, res) => {
//   try {
//     // 1. Define the model for subjectallocations if not already defined
//     if (!mongoose.models.SubjectAllocation) {
//       mongoose.model("SubjectAllocation", new mongoose.Schema({}, { strict: false }), "subjectallocations");
//     }

//     // 2. Fetch the allocation for the logged-in teacher
//     const allocation = await mongoose.model("SubjectAllocation").findOne({ 
//       teacher: new mongoose.Types.ObjectId(req.user.userId) 
//     });

//     if (!allocation) {
//       return res.status(200).json({ success: true, subjects: [] });
//     }

//     // 3. Transform the Arrays into a list of objects for the Flutter DataTable
//     // We map through the 'subjects' array and pair them with corresponding standards/divisions
//     const formattedSubjects = allocation.subjects.map((subject, index) => {
//       return {
//         subject_name: subject,
//         standard: allocation.standards[index] || "N/A",
//         // Since divisions is a nested array in your DB (Array of 5), 
//         // we join them as a string (e.g., "A, B, C, D, E")
//         division: Array.isArray(allocation.divisions) ? allocation.divisions.join(", ") : allocation.divisions
//       };
//     });

//     res.status(200).json({
//       success: true,
//       subjects: formattedSubjects
//     });
//   } catch (error) {
//     console.error("Fetch Subjects Error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };


exports.getMySubjects = async (req, res) => {
  try {
    if (!mongoose.models.SubjectAllocation) {
      mongoose.model("SubjectAllocation", new mongoose.Schema({}, { strict: false }), "subjectallocations");
    }

    const allocation = await mongoose.model("SubjectAllocation").findOne({ 
      teacher: new mongoose.Types.ObjectId(req.user.userId) 
    });

    if (!allocation) return res.status(200).json({ success: true, subjects: [] });

    const formattedSubjects = [];

    // ✅ FLATTENING LOGIC: Ensure every division in the nested array becomes a string
    allocation.subjects.forEach((subject, index) => {
      const std = allocation.standards[index] || "N/A";
      const divData = allocation.divisions[index];

      if (Array.isArray(divData)) {
        divData.forEach(d => {
          // If the DB has double nesting like [["A"]], take the inner value
          const finalDiv = Array.isArray(d) ? d[0] : d;
          formattedSubjects.push({
            subject_name: subject,
            standard: std,
            division: String(finalDiv).trim() 
          });
        });
      } else {
        formattedSubjects.push({
          subject_name: subject,
          standard: std,
          division: divData ? String(divData).trim() : "N/A"
        });
      }
    });

    res.status(200).json({ success: true, subjects: formattedSubjects });
  } catch (error) {
    console.error("Fetch Subjects Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


exports.getStaffAttendance = async (req, res) => {
  try {
    // req.user.username contains the STF-ID (e.g., "STF-PR-1-8309") from your login logic
    const attendance = await StaffAttendance.find({ 
      staffid: req.user.username 
    }).sort({ date: 1 });

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    console.error("Attendance Fetch Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Add this to controllers/authcontroller.js
exports.getExamsByStandard = async (req, res) => {
  try {
    const { standard } = req.params;
    const exams = await mongoose.connection.db.collection('exams').find({ 
      standard: standard 
    }).toArray();

    // Map the results to ensure 'time' always contains 'time_display'
    const formattedExams = exams.map(exam => ({
      ...exam,
      timetable: exam.timetable.map(slot => ({
        ...slot,
        // ✅ Explicitly map time_display to time for the frontend
        time: slot.time_display || slot.time || 'N/A' 
      }))
    }));

    res.status(200).json({ success: true, exams: formattedExams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// // Add this to controllers/authcontroller.js
// exports.getMyPaperEvaluations = async (req, res) => {
//   try {
//     const teacherId = req.user.userId; // Extracted from JWT token
    
//     // Query the 'paperevaluations' collection for this specific teacher
//     const evaluations = await mongoose.connection.db.collection('paperevaluations').find({ 
//       assignedteacher: new mongoose.Types.ObjectId(teacherId)
//     }).toArray();

//     res.status(200).json({ success: true, evaluations });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


// Function for Evaluation (Checking)
exports.getMyPaperEvaluations = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const evaluations = await mongoose.connection.db.collection('paperevaluations').find({ 
      assignedteacher: new mongoose.Types.ObjectId(teacherId)
    }).toArray();
    res.status(200).json({ success: true, evaluations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Function for Re-Checking
exports.getMyRecheckings = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const recheckings = await mongoose.connection.db.collection('recheckings').find({ 
      assignedTo: new mongoose.Types.ObjectId(teacherId)
    }).toArray();
    res.status(200).json({ success: true, recheckings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fetch all tests for a specific standard and division
exports.getTermAssessments = async (req, res) => {
  try {
    const { standard, division } = req.params;
    const db = mongoose.connection.db;
    const tests = await db.collection('termassessments').find({ standard, division }).toArray();
    res.status(200).json({ success: true, tests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new test record
// exports.createTestRecord = async (req, res) => {
//   try {
//     const db = mongoose.connection.db;
//     const newTest = {
//       ...req.body,
//       staffid: new mongoose.Types.ObjectId(req.user.userId),
//       createdAt: new Date(),
//       studentData: [] // Initialize empty marks array
//     };
//     await db.collection('termassessments').insertOne(newTest);
//     res.status(201).json({ success: true, message: "Test created successfully" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

exports.createTestRecord = async (req, res) => {
  try {
    const { standard, division } = req.body;
    const db = mongoose.connection.db;

    // Fetch students using the correct nested path
    const studentsInClass = await db.collection('students').find({ 
      "admission.admissionstd": standard, 
      "admission.admissiondivision": division 
    }).toArray();

    const initialStudentData = studentsInClass.map(student => ({
      rollNo: student.admission?.grno || "N/A", // Using GR No as Roll No
      name: `${student.firstname} ${student.lastname}`,
      marks: "" 
    }));

    const newTest = {
      ...req.body,
      staffid: new mongoose.Types.ObjectId(req.user.userId),
      createdAt: new Date(),
      studentData: initialStudentData 
    };

    await db.collection('termassessments').insertOne(newTest);
    res.status(201).json({ success: true, message: "Test created with students" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update student marks for a specific test
exports.updateTestMarks = async (req, res) => {
  try {
    const { testId } = req.params;
    const { studentData } = req.body; // Array of { rollNo, name, marks }
    const db = mongoose.connection.db;

    await db.collection('termassessments').updateOne(
      { _id: new mongoose.Types.ObjectId(testId) },
      { $set: { studentData: studentData, updatedAt: new Date() } }
    );
    res.status(200).json({ success: true, message: "Marks updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Add this to the bottom of authcontroller.js
exports.getTeacherAssignmentOptions = async (req, res) => {
  try {
    const teacherObjectId = new mongoose.Types.ObjectId(req.user.userId);
    const db = mongoose.connection.db;

    const classTeacherDoc = await db.collection('classrooms').findOne({ staffid: teacherObjectId });
    const subjectAllocation = await db.collection('subjectallocations').findOne({ teacher: teacherObjectId });

    let standardsSet = new Set();
    let divisionsSet = new Set();
    let subjectsSet = new Set();

    if (classTeacherDoc) {
      if (classTeacherDoc.standard) standardsSet.add(classTeacherDoc.standard.toString());
      if (classTeacherDoc.division) divisionsSet.add(classTeacherDoc.division.toString());
    }

    if (subjectAllocation) {
      if (Array.isArray(subjectAllocation.standards)) subjectAllocation.standards.forEach(s => s && standardsSet.add(s.toString()));
      if (Array.isArray(subjectAllocation.subjects)) subjectAllocation.subjects.forEach(sub => sub && subjectsSet.add(sub.toString()));
      if (Array.isArray(subjectAllocation.divisions)) {
        subjectAllocation.divisions.forEach(div => {
          if (Array.isArray(div)) div.forEach(d => d && divisionsSet.add(d.toString()));
          else if (div) divisionsSet.add(div.toString());
        });
      }
    }

    res.status(200).json({
      success: true,
      standards: Array.from(standardsSet).sort(),
      divisions: Array.from(divisionsSet).sort(),
      subjects: Array.from(subjectsSet).sort(),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Corrected to match your nested Student schema
exports.getStudentsByClass = async (req, res) => {
  try {
    const { standard, division } = req.params;
    const db = mongoose.connection.db;

    // We must query nested fields: admission.admissionstd and admission.admissiondivision
    const students = await db.collection('students').find({ 
      "admission.admissionstd": standard, 
      "admission.admissiondivision": division 
    }).sort({ "admission.grno": 1 }).toArray(); // Sorting by GR No or Roll No

    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Fetch fee structure for a standard
exports.getFeeStructure = async (req, res) => {
  try {
    const { standard } = req.params;
    const db = mongoose.connection.db;
    const structure = await db.collection('fees').findOne({ standard: standard });
    res.status(200).json({ success: true, structure });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentFeesStatus = async (req, res) => {
  try {
    const { standard, division } = req.params;
    const db = mongoose.connection.db;

    // 1. Get the total required fees for this standard (e.g., 4500)
    const feeStructure = await db.collection('fees').findOne({ standard: standard });
    const targetTotal = feeStructure ? feeStructure.total : 0;

    // 2. Fetch all students in the class
    const students = await db.collection('students').find({ 
      "admission.admissionstd": standard, 
      "admission.admissiondivision": division 
    }).toArray();

    // 3. For each student, find their total paid amount from 'paymententries'
    const feeStatus = await Promise.all(students.map(async (s) => {
      const name = `${s.firstname} ${s.lastname}`;
      
      // Look up payment entry for this specific student
      const paymentRecord = await db.collection('paymententries').findOne({ 
        name: name, 
        std: standard, 
        div: division 
      });

      // Sum up all installments paid
      let totalPaid = 0;
      if (paymentRecord && paymentRecord.installments) {
        totalPaid = paymentRecord.installments.reduce((sum, inst) => sum + inst.amount, 0);
      }

      return {
        studentid: s._id,
        name: name,
        rollNo: s.admission?.grno || "N/A",
        paidAmount: totalPaid,
        totalRequired: targetTotal,
        status: totalPaid >= targetTotal ? "Paid" : "Unpaid"
      };
    }));

    res.status(200).json({ success: true, students: feeStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMasterSubjectsByStandard = async (req, res) => {
  try {
    const { standard } = req.params; 
    const db = mongoose.connection.db;
    
    // Use a case-insensitive regex to match the standard string "1"
    // This handles potential whitespace or type mismatches
    const standardDoc = await db.collection('subjects').findOne({ 
      standard: { $regex: new RegExp(`^${standard.trim()}$`, 'i') } 
    });

    if (!standardDoc) {
      return res.status(404).json({ 
        success: false, 
        message: `Standard ${standard} not found.` 
      });
    }

    // Return the full objects so the frontend can use 'name', 'type', etc.
    res.status(200).json({
      success: true,
      standard: standardDoc.standard,
      subjects: standardDoc.subjects || [] 
    });
  } catch (error) {
    console.error("Fetch Subjects Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};