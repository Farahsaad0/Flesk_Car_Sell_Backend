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
  Verified: {
    type: Boolean,
    default: false,
  },

  Verified_code: {
    type: Number,
    default:false  },

    Statut: {
      type: String,
      enum: ["En attente", "Approuvé", "Rejeté"],
      default: "En attente"
    }

});

module.exports = mongoose.model("User", userSchema, "user");
