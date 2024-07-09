const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  techStack: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("Internship", internshipSchema);
