const mongoose = require("mongoose");

// exports.createAssessment = async (req, res) => {
//   try {
//     const { teacherId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date, standard, division } = req.body;

//     // Use direct database connection as required for the admin collection
//     const assessmentCollection = mongoose.connection.db.collection('assessments');

//     const newDoc = {
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
//     console.error("Assessment Controller Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

exports.createAssessment = async (req, res) => {
  try {
    const { teacherId, subjectCovered, topicCovered, keyPoints, classActivity, homework, date, standard, division } = req.body;

    const assessmentCollection = mongoose.connection.db.collection('assessments');

    // Define the search criteria (Teacher + Subject + Class + Specific Date)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      teacherId: mongoose.Types.ObjectId.isValid(teacherId) ? new mongoose.Types.ObjectId(teacherId) : teacherId,
      subjectCovered,
      standard,
      division,
      date: { $gte: startOfDay, $lte: endOfDay }
    };

    // Data to be saved
    const updateData = {
      $set: {
        topicCovered,
        keyPoints,
        classActivity,
        homework,
        updatedAt: new Date()
      },
      $setOnInsert: {
        teacherId: mongoose.Types.ObjectId.isValid(teacherId) ? new mongoose.Types.ObjectId(teacherId) : teacherId,
        subjectCovered,
        standard,
        division,
        date: new Date(date),
        createdAt: new Date()
      }
    };

    // findOneAndUpdate with upsert: true handles both Create and Edit in one go
    await assessmentCollection.findOneAndUpdate(query, updateData, { upsert: true });

    res.status(201).json({ success: true, message: "Assessment saved successfully" });
  } catch (error) {
    console.error("Assessment Controller Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// exports.getAssessment = async (req, res) => {
//   try {
//     const { teacherId, subject, standard, division, date } = req.query;
//     const assessmentCollection = mongoose.connection.db.collection('assessments');

//     // Search for an assessment created by this teacher for this class/subject on this day
//     const startOfDay = new Date(date);
//     startOfDay.setHours(0, 0, 0, 0);
//     const endOfDay = new Date(date);
//     endOfDay.setHours(23, 59, 59, 999);

//     const assessment = await assessmentCollection.findOne({
//       teacherId: new mongoose.Types.ObjectId(teacherId),
//       subjectCovered: subject,
//       standard: standard,
//       division: division,
//       date: { $gte: startOfDay, $lte: endOfDay }
//     });

//     if (assessment) {
//       res.status(200).json({ success: true, data: assessment });
//     } else {
//       res.status(200).json({ success: false, message: "No assessment found" });
//     }
//   } catch (error) {
//     console.error("Fetch Assessment Error:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };



exports.getAssessment = async (req, res) => {
  try {
    const { subject, standard, division, date } = req.query;
    const assessmentCollection = mongoose.connection.db.collection('assessments');

    // Search for an assessment for this class/subject on this specific day
    // We REMOVE the teacherId filter so any teacher can view the content
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const assessment = await assessmentCollection.findOne({
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







exports.checkAssessmentsAvailability = async (req, res) => {
  try {
    const { teacherId, standard, division, date, subjects } = req.body;
    const assessmentCollection = mongoose.connection.db.collection('assessments');

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find all assessments for this teacher/class/day
    const assessments = await assessmentCollection.find({
      teacherId: new mongoose.Types.ObjectId(teacherId),
      standard: standard,
      division: division,
      date: { $gte: startOfDay, $lte: endOfDay }
    }).toArray();

    // Create a list of subjects that have assessments
    const availableSubjects = assessments.map(a => a.subjectCovered);

    res.status(200).json({ success: true, availableSubjects });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};