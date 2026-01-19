const express = require("express");
const http = require("http"); // Import HTTP module
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes"); // ✅ Import Event Routes
const { Server } = require("socket.io"); // ✅ Import Socket.IO
const Message = require('./models/Message');
const mySubjectRoutes = require("./routes/mySubjectRoutes");
const timetableRoutes = require('./routes/timetableRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const messageRoutes= require('./routes/messageRoutes')
const teacherRoutes = require("./routes/teacherRoutes");

const app = express();
const PORT = 5000;

// ✅ Create HTTP Server
const server = http.createServer(app);

// ✅ Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ✅ Connect to Database
connectDB();

// ✅ Middleware
// app.use(cors());
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// ✅ Pass `io` to Routes
app.use("/api/events", (req, res, next) => {
  req.io = io; // Attach io to request object
  next();
}, eventRoutes); 

app.use("/api/auth", authRoutes); // Auth Routes
app.use("/api/mysubjects", mySubjectRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use("/api/teachers", teacherRoutes);



// ✅ Handle Socket.IO Connections
io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  // ✅ Join room for messaging (one room per user ID)
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`📥 User ${userId} joined room`);
  });

  // ✅ Listen for sending messages
  socket.on("send_message", async ({ senderId, receiverId, message }) => {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
  
    io.to(receiverId).emit("receive_message", {
      senderId,
      receiverId,
      message,
      timestamp: newMessage.timestamp,
    });
  });
  
  // ✅ Disconnect handler (for all features)
  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected:", socket.id);
  });
});

// ✅ Start Server
server.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${PORT}`);
});
module.exports = app;