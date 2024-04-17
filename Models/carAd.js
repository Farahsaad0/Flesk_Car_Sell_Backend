const mongoose = require("mongoose");

const carAdSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },

  description: { type: String, required: true, trim: true },

  prix: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value for price",
    },
  },

  marque: {
    type: String,
    required: true,
    trim: true,
  },

  modele: {
    type: String,
    required: true,
    trim: true,
  },

  location: {
    type: String,
    required: true,
    trim: true,
  },

  annee: {
    type: Number,
    required: true,
    min: 1900, // Assuming cars before 1900 are invalid
    max: new Date().getFullYear(), // Current year
  },

  kilometrage: {
    type: Number,
    min: 0, // Ensure mileage is positive
    default: 0,
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

  photo: {
    type: String,
    required: true,
  },

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
carAdSchema.index({ marque: 1, modele: 1 });
carAdSchema.index({ prix: 1 });
carAdSchema.index({ annee: 1 });

const CarAd = mongoose.model("CarAd", carAdSchema);

module.exports = CarAd;
