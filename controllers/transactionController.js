const express = require("express");
const Transaction = require("../Models/transaction");

// Read route
const getInactivatedSponsorships = async (req, res) => {
  try {
    const sponsorships = await Transaction.find({
      userId: req.params.userId,
      redeemed: false,
      paymentStatus: "completed",
    });
    if (sponsorships.length === 0) {
      return res
        .status(404)
        .json({ success: "No Inactivated Sponsorships for this user" });
    }
    res.status(200).json(sponsorships);
  } catch (error) {
    console.error("Error fetching inactivated sponsorships:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getInactivatedSponsorships };
