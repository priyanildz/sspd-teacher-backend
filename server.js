// const mongoose = require('mongoose');
// const express = require("express");
// const http = require("http"); 
// const cors = require("cors");
// const bodyParser = require("body-parser");
// require("dotenv").config();
// const connectDB = require("./config/db");
// const authRoutes = require("./routes/authRoutes");
// const eventRoutes = require("./routes/eventRoutes"); 
// const { Server } = require("socket.io"); 
// const Message = require('./models/Message');
// const mySubjectRoutes = require("./routes/mySubjectRoutes");
// const timetableRoutes = require('./routes/timetableRoutes');
// // const announcementRoutes = require('./enabled-announcementRoutes');
// const announcementRoutes = require('./routes/announcementRoutes');
// const messageRoutes= require('./routes/messageRoutes')
// const teacherRoutes = require("./routes/teacherRoutes");

// const app = express();
// const PORT = process.env.PORT || 5000; // Use process.env.PORT for Vercel

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// connectDB();

// app.use(cors({
//   origin: "*", 
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization"]
// }));
// app.use(bodyParser.json());

// app.use("/api/events", (req, res, next) => {
//   req.io = io; 
//   next();
// }, eventRoutes); 

// app.use("/api/auth", authRoutes);
// app.use("/api/mysubjects", mySubjectRoutes);
// app.use('/api/timetable', timetableRoutes);
// app.use('/api/announcements', announcementRoutes);
// app.use('/api/messages', messageRoutes);
// app.use("/api/teachers", teacherRoutes);

// io.on("connection", (socket) => {
//   console.log("🔌 New client connected:", socket.id);
//   socket.on("join", (userId) => {
//     socket.join(userId);
//   });
//   socket.on("send_message", async ({ senderId, receiverId, message }) => {
//     const newMessage = new Message({ senderId, receiverId, message });
//     await newMessage.save();
//     io.to(receiverId).emit("receive_message", {
//       senderId, receiverId, message, timestamp: newMessage.timestamp,
//     });
//   });
//   socket.on("disconnect", () => {
//     console.log("🔌 Client disconnected:", socket.id);
//   });
// });

// // Add this route directly in your main server file after other app.use statements
// app.post("/api/assessments/create", async (req, res) => {
//   try {
//     const { teacherId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date, standard, division } = req.body;

//     // Check if we are connected to the DB
//     if (!mongoose.connection || !mongoose.connection.db) {
//         return res.status(500).json({ success: false, message: "Database connection not established" });
//     }

//     const assessmentCollection = mongoose.connection.db.collection('assessments');

//     const newDoc = {
//       // ✅ Using mongoose.Types.ObjectId only if teacherId is a valid string
//       teacherId: mongoose.Types.ObjectId.isValid(teacherId) 
//                  ? new mongoose.Types.ObjectId(teacherId) 
//                  : teacherId,
//       subjectCovered,
//       topicCovered,
//       keyPoints,
//       classActivity,
//       homework,
//       date: date ? new Date(date) : new Date(),
//       standard,
//       division,
//       createdAt: new Date(),
//       updatedAt: new Date()
//     };

//     await assessmentCollection.insertOne(newDoc);

//     res.status(201).json({ success: true, message: "Assessment created successfully" });
//   } catch (error) {
//     console.error("Direct Assessment Creation Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // ✅ ONLY listen if we are NOT on Vercel
// if (process.env.NODE_ENV !== 'production') {
//   server.listen(PORT, () => {
//     console.log(`✅ Local Server running on port ${PORT}`);
//   });
// }

// // ✅ EXPORT the app for Vercel
// module.exports = app;


const mongoose = require('mongoose');
const express = require("express");
const http = require("http"); 
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes"); 
const { Server } = require("socket.io"); 
const Message = require('./models/Message');
const mySubjectRoutes = require("./routes/mySubjectRoutes");
const timetableRoutes = require('./routes/timetableRoutes');
const assessmentRoutes = require("./routes/assessmentRoutes");
// const announcementRoutes = require('./enabled-announcementRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const messageRoutes= require('./routes/messageRoutes')
const teacherRoutes = require("./routes/teacherRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const attendanceRoutes = require('./routes/attendanceRoutes');
const syllabusRoutes = require("./routes/syllabusRoutes");

const app = express();
const PORT = process.env.PORT || 5000; // Use process.env.PORT for Vercel

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

connectDB();

app.use(cors({
  origin: "*", 
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

app.use("/api/events", (req, res, next) => {
  req.io = io; 
  next();
}, eventRoutes); 

app.use("/api/auth", authRoutes);
app.use("/api/mysubjects", mySubjectRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/leaves", leaveRoutes);
app.use('/api/teachers', attendanceRoutes);
app.use("/api/syllabus", syllabusRoutes);

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("send_message", async ({ senderId, receiverId, message }) => {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    io.to(receiverId).emit("receive_message", {
      senderId, receiverId, message, timestamp: newMessage.timestamp,
    });
  });
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});


// ✅ ONLY listen if we are NOT on Vercel
if (process.env.NODE_ENV !== 'production') {
  server.listen(PORT, () => {
    console.log(`✅ Local Server running on port ${PORT}`);
  });
}

// ✅ EXPORT the app for Vercel
module.exports = app;