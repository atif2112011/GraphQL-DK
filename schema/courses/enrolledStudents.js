const mongoose = require("mongoose");

const enrolledStudentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  enrolled: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      enrolledAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
});

const Enrollment = mongoose.model("Enrollment", enrolledStudentSchema);

module.exports = Enrollment;
