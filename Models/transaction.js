const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
    },

    type: {
      type: String,
      enum: ["sponsorship", "expert consultation", "down payment"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    expertGotPaid: Boolean,

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      required: true,
    },

    paymentId: {
      type: String,
      required: true,
    },

    sponsorship: {
      type: String,
    },
    
    duration: Number,

    features: {
      type: [
        {
          type: String,
        },
      ],
    },

    expirationDate: {
      type: Date,
    },

    sponsorshipStatus: {
      type: String,
      enum: ["active", "expired", "pending"],
      default: "active",
    },

    redeemed: Boolean,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
