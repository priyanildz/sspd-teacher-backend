// const mongoose = require('mongoose');

// const announcementSchema = new mongoose.Schema({
//   std: String,
//   className: String,
//   publishTo: String,
//   subject: String,
//   message: String,
//   date: { type: Date, default: Date.now },
//   senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
//   status: { type: String, enum: ['draft', 'sent'], default: 'draft' }
// });

// module.exports = mongoose.model('Announcement', announcementSchema);



const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema(
  {
    announcementId: {
      type: String,
      default: () => `ANN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    // Using title as the primary key to match your screenshot
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Using description to match your screenshot
    description: {
      type: String,
      required: true,
    },
    // Supporting 'subject' and 'message' as virtuals for Flutter compatibility
    // Or simply mapping them in the controller as shown in the previous step
    std: {
      type: String,
      default: "",
    },
    className: {
      type: String,
      default: "",
    },
    visibility: {
      type: String,
      enum: ["all", "specific"],
      default: "specific",
    },
    publishTo: {
      type: String,
      enum: ["Principal", "Teacher", "Finance", "Admin", "All", "Student"],
      default: "Admin",
    },
    priority: {
      type: String,
      default: "1",
    },
    department: {
      type: String,
      default: "General",
    },
    status: {
      type: String,
      enum: ["draft", "sent"],
      default: "draft",
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'staff', // Matches the exported model name in User.js
      required: true,
    },
    schedule: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt
  }
);

module.exports = mongoose.model('Announcement', announcementSchema);