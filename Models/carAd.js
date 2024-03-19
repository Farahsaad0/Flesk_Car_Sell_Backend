const mongoose = require("mongoose");

const carAdSchema = new mongoose.Schema({
  titre: { type: String, required: true },

  description: { type: String, required: true },

  prix: { type: Number, required: true },

  marque: { type: String, required: true },

  modele: { type: String, required: true },

  annee: {
    type: Number,
    required: true,
  },

  date: { type: Date, default: Date.now },

  photo: { type: String, required: true },

  sponsorship: { type: String, enum: ["Gold", "Silver", "Bronze"] }, // Champ de parrainage
  // Ajouter une référence à l'utilisateur
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const CarAd = mongoose.model("CarAd", carAdSchema);

module.exports = CarAd;
