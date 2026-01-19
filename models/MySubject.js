const mongoose = require("mongoose");

const MySubjectSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // 🔥 Change teacher_id to user_id
    subjects: [
        {
            subject_name: { type: String, required: true },
            standard: { type: String, required: true },
            division: { type: String, required: true },
        }
    ],
});

module.exports = mongoose.model("MySubject", MySubjectSchema);
