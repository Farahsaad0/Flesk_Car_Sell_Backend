const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  Nom: {
    type: String,
    required: true,
  },
  Prenom: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
    unique: true,
  },
  Password: {
    type: String,
    required: true,
  },
  Role: {
    type: String,
    enum: ["Acheteur", "Vendeur", "Expert", "Administrateur"],
  },
});

module.exports = mongoose.model("User", userSchema, "user");
