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

exports.getAssessment = async (req, res) => {
  try {
    const { teacherId, subject, standard, division, date } = req.query;
    const assessmentCollection = mongoose.connection.db.collection('assessments');

    // Search for an assessment created by this teacher for this class/subject on this day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const assessment = await assessmentCollection.findOne({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      subjectCovered: subject,
      standard: standard,
      division: division,
      date: { $gte: startOfDay, $lte: endOfDay }
    });

    if (assessment) {
      res.status(200).json({ success: true, data: assessment });
    } else {
      res.status(200).json({ success: false, message: "No assessment found" });
    }
  } catch (error) {
    console.error("Fetch Assessment Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};