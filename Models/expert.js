const mongoose = require("mongoose");

const expertSchema = new mongoose.Schema({
  approuvé: {
    type: Boolean,
    default: false,
  },

  bloqué: {
    type: Boolean,
    default: false,
  },

  spécialité: {
    type: String,
    required: true,
  },

  // UserId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User",
  // },
});

const Expert = mongoose.model("ExpertProfile", expertSchema);

module.exports = Expert;
