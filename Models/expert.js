const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  approuvé: {
    type: Boolean,
    default: false,
  },

  spécialité: {
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

  konnect_link: {
    type: String,
    required: true,
    default: "https://api.preprod.konnect.network/ITf8R2THT",
  },
});

const Expert = mongoose.model("ExpertProfile", expertSchema);

module.exports = Expert;
