const mongoose = require("mongoose");

exports.createAssessment = async (req, res) => {
  try {
    const { teacherId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date, standard, division } = req.body;

    // Use direct database connection as required for the admin collection
    const assessmentCollection = mongoose.connection.db.collection('assessments');

    const newDoc = {
      teacherId: mongoose.Types.ObjectId.isValid(teacherId) 
                 ? new mongoose.Types.ObjectId(teacherId) 
                 : teacherId,
      subjectCovered,
      topicCovered,
      keyPoints,
      classActivity,
      homework,
      date: date ? new Date(date) : new Date(),
      standard,
      division,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await assessmentCollection.insertOne(newDoc);

    res.status(201).json({ success: true, message: "Assessment created successfully" });
  } catch (error) {
    console.error("Assessment Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};