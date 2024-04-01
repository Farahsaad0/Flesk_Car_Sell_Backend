const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: String, // You can adjust this according to your needs, could be in days, months, years, etc.
    required: true,
  },
  features: {
    type: [String], // Array of features included in the subscription plan
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true, // Indicates whether the subscription plan is currently active or not
  },
  createdAt: {
    type: Date,
    default: Date.now, // Timestamp of when the subscription plan was created
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
