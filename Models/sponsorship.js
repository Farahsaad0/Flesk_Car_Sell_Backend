const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define enum for features
const featureEnum = [
  "Highlighted Listing",
  "Featured in Search Results",
  "Featured on Homepage",
  "Priority Support",
  "Extended Listing Duration",
];

const sponsorshipSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  features: {
    type: [
      {
        type: String,
        enum: featureEnum,
      },
    ],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sponsorship", sponsorshipSchema);
