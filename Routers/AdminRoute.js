const express = require("express");
const router = express.Router();
const User = require("../Models/User");

let getAdminUser = async (req, res) => {
  try {
    // Find the user with role "Administrateur"
    const adminUser = await User.findOne({ Role: "Administrateur" });

    if (!adminUser) {
      return res
        .status(404)
        .json({ message: "No user with role 'Administrateur' found." });
    }

    res.status(200).json(adminUser);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res
      .status(500)
      .json({ error: "Error fetching user information: " + error });
  }
};

module.exports = {
  getAdminUser,
};
