const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

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
    enum: ["pending", "accepted", "rejected", "cancelled", "completed"],
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

  paymentLink: String,

  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },

  chat: [chatSchema],

  documents: [String],
});

// Indexes
jobSchema.index({ client: 1, expert: 1 }); // Example index on client and expert fields

module.exports = mongoose.model("job", jobSchema);
