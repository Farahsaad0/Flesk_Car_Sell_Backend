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
    type: Number, 
    required: true,
  },
  features: {
    type: [String], 
    required: true,
  },
  // themeColor: {
  //   type: String,
  //   required: true,
  // },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
});

module.exports = mongoose.model("Subscription", subscriptionSchema);
