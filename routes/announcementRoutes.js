// const express = require('express');
// const router = express.Router();
// const authMiddleware = require('../middleware/authMiddleware');
// const jwt = require("jsonwebtoken");
// const Announcement = require('../models/Announcement');


// const extractNumber = (standardStr) => {
//   return standardStr?.match(/\d+/)?.[0] || "";
// };

// const numberToRoman = (num) => {
//   const romanMap = {
//     "1": "I", "2": "II", "3": "III", "4": "IV", "5": "V",
//     "6": "VI", "7": "VII", "8": "VIII", "9": "IX", "10": "X"
//   };
//   return romanMap[num] || "";
// };

// router.post('/add-announcement', authMiddleware, async (req, res) => {
//   try {
//     const { std, className, publishTo, subject, message, status } = req.body;

//     const newAnnouncement = new Announcement({
//       std,
//       className,
//       publishTo,
//       title: subject,       // Map 'subject' from flutter to 'title' in DB
//       description: message, // Map 'message' from flutter to 'description' in DB
//       status,
//       senderId: req.user.userId,
//     });

//     await newAnnouncement.save();
//     res.status(201).json(newAnnouncement);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// router.get('/get-announcement', async (req, res) => {
//     try {
//       const authHeader = req.headers.authorization;
//       if (!authHeader || !authHeader.startsWith("Bearer ")) {
//         return res.status(401).json({ error: "Unauthorized" });
//       }
  
//       const token = authHeader.split(" ")[1];
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       const userId = decoded.userId;
//       const { status, std, className } = req.query;
  
//       let filter = {};
  
//       if (status === "sent") {
//         filter.senderId = userId; 
//       } else if (status === "inbox") {
//         // Updated filter: Show things marked for 'all' OR matching the teacher's class
//         filter = {
//           status: "sent",
//           $or: [
//             { visibility: "all" },
//             { std: std, className: className }
//           ]
//         };
//       } else if (status === "draft") {
//           filter = { status: "draft", senderId: userId };
//       }
  
//       const announcements = await Announcement.find(filter)
//         .sort({ createdAt: -1 }) // Sort by creation date
//         .populate('senderId', 'name email');
  
//       res.json(announcements);
//     } catch (e) {
//       console.error("Failed to load announcements:", e);
//     res.status(500).json({ error: e?.message || "Server error" });
//     }
// });


// // PUT: Update announcement status (e.g., sending a draft)
// router.put('/update-status/:id', authMiddleware, async (req, res) => {
//   try {
//     const { status } = req.body;
//     const updatedAnnouncement = await Announcement.findByIdAndUpdate(
//       req.params.id,
//       { status: status },
//       { new: true }
//     );

//     if (!updatedAnnouncement) {
//       return res.status(404).json({ error: "Announcement not found" });
//     }

//     res.json(updatedAnnouncement);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });
  

// module.exports = router;




const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const jwt = require("jsonwebtoken");
const Announcement = require('../models/Announcement');

// POST: Create a new announcement (handles both Sent and Draft)
router.post('/add-announcement', authMiddleware, async (req, res) => {
  try {
    const { std, className, publishTo, subject, message, status } = req.body;

    const newAnnouncement = new Announcement({
      std: std || "",
      className: className || "",
      publishTo,
      title: subject,       // Map 'subject' from flutter to 'title' in DB
      description: message, // Map 'message' from flutter to 'description' in DB
      status,
      senderId: req.user.userId,
      // If student is selected, mark visibility as specific to the class
      visibility: publishTo === "Student" ? "specific" : "all"
    });

    await newAnnouncement.save();
    res.status(201).json(newAnnouncement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET: Get announcements based on tab (Inbox, Draft, Sent)
router.get('/get-announcement', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.userId;
      const { status, std, className } = req.query;
  
      let filter = {};
  
      if (status === "sent") {
        // Tab: Sent - Show everything the current user sent
        filter.senderId = userId; 
      } else if (status === "draft") {
        // Tab: Draft - Show only drafts saved by the current user
        filter = { status: "draft", senderId: userId };
      } else if (status === "inbox") {
        // Tab: Inbox - Show announcements sent BY OTHERS to this teacher
        // OR announcements sent to Students in this teacher's specific class
        filter = {
          status: "sent",
          $or: [
            { publishTo: "Teacher" },
            { publishTo: "All" },
            { 
              publishTo: "Student", 
              std: std, 
              className: className 
            }
          ]
        };
      }
  
      const announcements = await Announcement.find(filter)
        .sort({ createdAt: -1 })
        .populate('senderId', 'name email');
  
      res.json(announcements);
    } catch (e) {
      console.error("Failed to load announcements:", e);
      res.status(500).json({ error: e?.message || "Server error" });
    }
});

// PUT: Update announcement status (e.g., sending a draft)
router.put('/update-status/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const updatedAnnouncement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { status: status },
      { new: true }
    );

    if (!updatedAnnouncement) {
      return res.status(404).json({ error: "Announcement not found" });
    }

    res.json(updatedAnnouncement);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;