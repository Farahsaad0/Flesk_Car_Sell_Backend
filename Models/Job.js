const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  expert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CarAd",
    required: true,
  },

  accepted: {
    type: String,
    enum: ["pending", "accepted", "rejected",],
    default: "pending",
  },

  jobDescription: {
    type: String,
    required: true,
  },

  submitDate: {
    type: Date,
    default: Date.now,
    required: true,
  },

  acceptDate: {
    type: Date,
  },

  endDate: {
    type: Date,
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "cancelled",],
    default: "pending",
  },
});

module.exports = mongoose.model("job", jobSchema);
