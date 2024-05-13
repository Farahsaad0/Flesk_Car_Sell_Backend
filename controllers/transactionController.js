const express = require("express");
const Transaction = require("../Models/transaction");

// Read route
const getInactivatedSponsorships = async (req, res) => {
  try {
    const sponsorships = await Transaction.find({
      sender: req.params.userId,
      sponsorshipStatus: "pending",
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

// Function to check and update sponsorship status
const checkAndUpdateSponsorshipStatus = async () => {
  try {
    const currentDate = new Date();

    const transactions = await Transaction.find({
      sponsorshipStatus: "active",
      expirationDate: { $lt: currentDate },
    });

    for (const transaction of transactions) {
      await updateSponsorshipStatus(transaction._id, "expired");
    }
  } catch (error) {
    console.error("Error checking and updating sponsorship status:", error);
  }
};

// Function to update sponsorship status
const updateSponsorshipStatus = async (transactionId, status) => {
  try {
    await Transaction.findByIdAndUpdate(transactionId, {
      sponsorshipStatus: status,
    });
  } catch (error) {
    console.error("Error updating sponsorship status:", error);
    throw error;
  }
};

// Schedule expiration check to run periodically
setInterval(checkAndUpdateSponsorshipStatus, 86400000);

module.exports = { getInactivatedSponsorships };
