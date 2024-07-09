const mongoose = require("mongoose");

const selectedInternSchema = new mongoose.Schema({
  internId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Internship",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  isProvisional: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("selectedIntern", selectedInternSchema);
