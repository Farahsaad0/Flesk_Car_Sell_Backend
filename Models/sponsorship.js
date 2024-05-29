const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define enum for features
const featureEnum = [
  
"Annonce mise en avant",
"Mis en avant dans les résultats de recherche",
"Mis en avant sur la page d'accueil",
"Durée de publication prolongée",
];

const sponsorshipSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  features: {
    type: [
      {
        type: String,
        enum: featureEnum,
      },
    ],
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Sponsorship", sponsorshipSchema);
