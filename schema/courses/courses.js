const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isSuspend: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    suspendRequest: {
      type: Boolean,
      default: false,
    },
    modules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Module",
      },
    ],
    fees: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// roleSchema.index({ id: 1 }, { unique: true });
// roleSchema.index({ name: 1 }, { unique: true });
// roleSchema.index({ id: 1,name:1 }, { unique: true });
// roleSchema.index({ id: 1,name:1,description:1 }, { unique: true });

const Courses = mongoose.model("Course", courseSchema);

module.exports = Courses;
