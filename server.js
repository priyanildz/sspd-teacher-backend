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
// const announcementRoutes = require('./enabled-announcementRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const messageRoutes= require('./routes/messageRoutes')
const teacherRoutes = require("./routes/teacherRoutes");
const assessmentRoutes = require('./routes/assessmentRoutes');

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
app.use("/api/assessments", assessmentRoutes);
app.use("/api/teachers", teacherRoutes);

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