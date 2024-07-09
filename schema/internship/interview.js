// ./schema/internship/interview.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const interviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User", 
  },
  internId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Internship", 
  },
  interviewDate: {
    type: Date,
    required: true,
  },
  interviewer: {
    type: String,
    required: true,
  },
});

const Interview = mongoose.model("Interview", interviewSchema);

module.exports = Interview;
