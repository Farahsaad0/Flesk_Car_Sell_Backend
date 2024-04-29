const mongoose = require("mongoose");

const carAdCacheSchema = new mongoose.Schema({
  titre: { type: String, trim: true },

  description: { type: String, trim: true },

  prix: {
    type: Number,
    min: 0,
  },

  marque: {
    type: String,
    trim: true,
  },

  modele: {
    type: String,
    trim: true,
  },

  location: {
    type: String,
    trim: true,
  },

  annee: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear(),
  },

  kilometrage: {
    type: Number,
  },

  etat: {
    type: String,
    enum: ["neuf", "occasion"],
    default: "occasion",
  },

  date: {
    type: Date,
    default: Date.now,
  },

  // photo: {
  //   type: String,
  // },

  sponsorship: {
    type: String,
    enum: ["Gold", "Silver", "Bronze"],
  },

  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

// Indexes
carAdCacheSchema.index({ marque: 1, modele: 1 });
carAdCacheSchema.index({ prix: 1 });
carAdCacheSchema.index({ annee: 1 });

const CarAdCache = mongoose.model("CarAdCache", carAdCacheSchema);

module.exports = CarAdCache;
