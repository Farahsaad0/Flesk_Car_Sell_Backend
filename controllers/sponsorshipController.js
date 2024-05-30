const Sponsorship = require("../Models/sponsorship");

let createSponsorship = async (req, res) => {
  try {
    const { type, price, duration, features, isActive } = req.body;

    const newSponsorship = new Sponsorship({
      type,
      price,
      duration,
      features,
      isActive,
      // themeColor,
    });

    const savedSponsorship = await newSponsorship.save();

    res.status(201).json(savedSponsorship);
  } catch (error) {
    console.error("Error creating sponsorship:", error);
    res.status(500).json({ error: "Failed to create sponsorship " + error });
  }
};

let getAllSponsorships = async (req, res) => {
  try {
    const sponsorships = await Sponsorship.find();

    res.status(200).json(sponsorships);
  } catch (error) {
    console.error("Error retrieving sponsorships:", error);
    res.status(500).json({ error: "Failed to retrieve sponsorships" });
  }
};

let getOneSponsorship = async (req, res) => {
  try {
    const { id } = req.params;
    const sponsorship = await Sponsorship.findById(id);

    if (!sponsorship) {
      return res.status(404).json({ error: "Sponsorship not found" });
    }

    res.status(200).json(sponsorship);
  } catch (error) {
    console.error("Error retrieving sponsorship:", error);
    res.status(500).json({ error: "Failed to retrieve sponsorship" });
  }
};

let updateSponsorship = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, price, duration, features, isActive } = req.body;

    const updatedSponsorship = await Sponsorship.findByIdAndUpdate(
      id,
      { type, price, duration, features, isActive },
      { new: true }
    );

    if (!updatedSponsorship) {
      return res.status(404).json({ error: "Sponsorship not found" });
    }

    res.status(200).json(updatedSponsorship);
  } catch (error) {
    console.error("Error updating sponsorship:", error);
    res.status(500).json({ error: "Failed to update sponsorship" });
  }
};

let deleteSponsorship = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSponsorship = await Sponsorship.findByIdAndDelete(id);

    if (!deletedSponsorship) {
      return res.status(404).json({ error: "Sponsorship not found" });
    }
    console.log("Sponsorship pack supprimée avec succès :", deletedSponsorship);
    res.status(200).json({ message: "Sponsorship pack supprimée avec succès." });
  } catch (error) {
    console.error("Error DELETEING sponsorship:", error);
    res.status(500).json({ error: "Failed to DELETE sponsorship" });
  }
};

module.exports = {
  createSponsorship,
  getAllSponsorships,
  getOneSponsorship,
  updateSponsorship,
  deleteSponsorship,
};
