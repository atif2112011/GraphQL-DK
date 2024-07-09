const mongoose = require("mongoose");

const waitlistSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  joined: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
});

const Waitlist = mongoose.model("Waitlist", waitlistSchema);

module.exports = Waitlist;
