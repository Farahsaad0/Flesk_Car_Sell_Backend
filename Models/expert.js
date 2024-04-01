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

});

const Expert = mongoose.model("ExpertProfile", expertSchema);

module.exports = Expert;
