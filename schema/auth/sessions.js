const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Session expires after 7 days
  },
  locationInfo: {
    type: Object,
  },
  deviceInfo: {
    type: Object,
  },
});

sessionSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });
sessionSchema.index({ userId: 1 });
sessionSchema.index({ userId: 1, _id: 1 }, { unique: true });

const Sessions = mongoose.model("Sessions", sessionSchema);

module.exports = Sessions;
