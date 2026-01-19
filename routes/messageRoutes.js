const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const authMiddleware = require("../middleware/authMiddleware");

// POST: Send a message
// ✅ FIXED POST /api/messages/send
router.post("/send", authMiddleware, async (req, res) => {
  const { receiverId, message } = req.body; // ✅ use `message`, not `content`
  const senderId = req.user.userId;

  try {
    const newMessage = new Message({ senderId, receiverId, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});


// GET: Get messages between two users
// GET /api/messages/:receiverId
router.get("/:receiverId", authMiddleware, async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.receiverId;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ timestamp: 1 });

    // 🔧 Transform 'content' field to 'message' for frontend compatibility
    const transformedMessages = messages.map(msg => ({
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message, // ✅ Rename here
      timestamp: msg.timestamp
    }));

    res.status(200).json({ messages: transformedMessages });
  } catch (err) {
    console.error("Failed to fetch messages:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// GET /api/messages/summary
router.get("/summary/all", authMiddleware, async (req, res) => {
  const userId = req.user.userId;

  try {
    // Get the latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId }
          ]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            sender: "$senderId",
            receiver: "$receiverId",
          },
          message: { $first: "$message" },
          timestamp: { $first: "$timestamp" },
          senderId: { $first: "$senderId" },
          receiverId: { $first: "$receiverId" },
        }
      }
    ]);

    // Calculate unread counts
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          receiverId: userId,
          isRead: false
        }
      },
      {
        $group: {
          _id: "$senderId",
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = {};
    unreadCounts.forEach(entry => {
      unreadMap[entry._id] = entry.count;
    });

    const formatted = conversations.map(convo => {
      const otherUserId =
        convo.senderId === userId ? convo.receiverId : convo.senderId;

      return {
        userId: otherUserId,
        lastMessage: convo.message,
        timestamp: convo.timestamp,
        unreadCount: unreadMap[otherUserId] || 0,
      };
    });

    res.json({ conversations: formatted });
  } catch (err) {
    console.error("Error in message summary:", err);
    res.status(500).json({ error: "Failed to fetch message summary" });
  }
});

// POST /api/messages/mark-read/:senderId
router.post("/mark-read/:senderId", authMiddleware, async (req, res) => {
  const receiverId = req.user.userId;
  const senderId = req.params.senderId;

  try {
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Messages marked as read" });
  } catch (err) {
    console.error("Error marking as read:", err);
    res.status(500).json({ error: "Failed to mark messages as read" });
  }
});

// PUT: Mark messages as read from a specific sender
router.put("/mark-read/:senderId", authMiddleware, async (req, res) => {
  const receiverId = req.user.userId;
  const senderId = req.params.senderId;

  try {
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to mark messages as read:", err);
    res.status(500).json({ error: "Failed to update messages" });
  }
});





  

module.exports = router;
