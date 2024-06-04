const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  approuvé: {
    type: Boolean,
    default: false,
  },

  specialite: {
    type: String,
    required: true,
  },

  prix: {
    type: String,
    required: true,
  },

  experience: {
    type: String,
    required: true,
  },

  documentDeConfiance: [String],
});

const Expert = mongoose.model("ExpertProfile", expertSchema);

module.exports = Expert;
