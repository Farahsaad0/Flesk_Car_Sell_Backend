const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

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
    min: 1900, 
    max: new Date().getFullYear(), 
  },

  kilometrage: {
    type: Number,
    min: 0,
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

// Middleware to delete associated photo when a CarAd is removed
carAdSchema.pre('remove', function(next) {
  // Assuming photos are stored in the 'public/uploads' directory
  const photoPath = path.join(__dirname, '..', 'public', 'uploads', this.photo);
  
  // Delete the photo file
  fs.unlink(photoPath, (err) => {
    if (err) {
      console.error("Error deleting photo:", err);
    } else {
      console.log("Deleted photo:", photoPath);
    }
  });

  next();
});

const CarAd = mongoose.model("CarAd", carAdSchema);

module.exports = CarAd;
