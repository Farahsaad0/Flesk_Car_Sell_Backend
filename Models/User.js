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
    enum: ["Utilisateur", "Expert", "Administrateur"],
    default: "Utilisateur",
  },

  Numero: {
    type: String,
    required: true,
    default: 0,
  },

  Adresse: {
    type: String,
    required: true,
    default: "default address",
  },

  Verified: {
    type: Boolean,
    default: false,
  },

  Verified_code: {
    type: Number,
    default: false,
  },
  // photo: {
  //   type: String,
  // },

  ExpertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ExpertProfile",
  },

  JoinDate: {
    type: Date,
    default: Date.now,
  },

  Statut: {
    type: String,
    enum: ["En attente", "Approuvé", "Rejeté", "Bloqué"],
    default: "En attente",
  },

  photo: {
    type: String,
    default: "DefaultProfilePicture.jpg",
  },

  refreshToken: String,
});

module.exports = mongoose.model("User", userSchema, "user");
