const mongoose = require("mongoose");

const querySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["open", "verified", "resolved"],
      default: "open",
    },
    category: {
      type: String,
      enum: ["course", "finance", "management"],
      required: true,
    },
    mmId: {
      //mmId = manager , mentor id
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    resolveMessage: {
      type: String,
      default: null,
    },
    parentQueryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Query",
      default: null,
    },
  },
  { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);
module.exports = Query;
