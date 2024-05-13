const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const featureSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  }
});

module.exports = mongoose.model("Feature", featureSchema);
