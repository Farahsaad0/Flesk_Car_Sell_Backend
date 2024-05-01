const express = require("express");
const CarAdCache = require("../models/carAdCache");

// Create route
const createCarAdCache = async (req, res) => {
  try {
    // Remove empty fields from req.body
    const filteredBody = Object.fromEntries(
      Object.entries(req.body).filter(([key, value]) => value !== "")
    );

    // Check if there is another CarAdCache with the same user
    const existingCarAd = await CarAdCache.findOne({
      utilisateur: filteredBody.utilisateur,
    });

    let newCarAd;
    if (existingCarAd) {
      // Update the existing CarAdCache with the new data
      existingCarAd.set(filteredBody);
      newCarAd = await existingCarAd.save();
    } else {
      // Create a new CarAdCache
      newCarAd = await CarAdCache.create(filteredBody);
    }

    res.status(201).json(newCarAd);
  } catch (error) {
    console.error("Error creating or updating car ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Read route
const getCarAdCache = async (req, res) => {
  try {
    const carAd = await CarAdCache.findOne({
      utilisateur: req.params.userId,
    })
      .sort({ $natural: -1 })
      .limit(1)
      .select("-__v");
    if (!carAd) {
      return res.status(404).json({ error: "Car ad not found" });
    }
    res.status(200).json(carAd);
  } catch (error) {
    console.error("Error fetching car ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Delete route
const deleteCarAdCache = async (req, res) => {
  try {
    const deletedCarAd = await CarAdCache.findByIdAndDelete(req.params.id);
    if (!deletedCarAd) {
      return res.status(404).json({ error: "Car ad not found" });
    }
    res.status(200).json({ message: "Car ad deleted successfully" });
  } catch (error) {
    console.error("Error deleting car ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createCarAdCache,
  getCarAdCache,
  deleteCarAdCache,
};
