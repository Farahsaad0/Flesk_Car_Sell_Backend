const express = require("express");
const Transaction = require("../Models/transaction");
const emailSender = require("../utils/sendEmail");

// Read route
const getInactivatedSponsorships = async (req, res) => {
  try {
    const sponsorships = await Transaction.find({
      sender: req.params.userId,
      sponsorshipStatus: "pending",
      paymentStatus: "completed",
    });
    // if (sponsorships.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ success: "No Inactivated Sponsorships for this user" });
    // }
    res.status(200).json(sponsorships);
  } catch (error) {
    console.error("Error fetching inactivated sponsorships:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getMonthName = (monthIndex) => {
  const months = [
    "Janv",
    "Févr",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sept",
    "Oct",
    "Nov",
    "Déc",
  ];
  return months[monthIndex];
};

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      paymentStatus: "completed",
    });
    const aggregatedData = {};

    transactions.forEach((transaction) => {
      const monthIndex = new Date(transaction.createdAt).getMonth();
      const monthName = getMonthName(monthIndex);

      if (!aggregatedData[monthName]) {
        aggregatedData[monthName] = {
          sponsorship: 0,
          expertConsultation: 0,
        };
      }

      if (transaction.type === "sponsorship") {
        aggregatedData[monthName].sponsorship += transaction.amount;
      } else if (transaction.type === "expert consultation") {
        aggregatedData[monthName].expertConsultation += transaction.amount;
      }
    });

    const categories = Object.keys(aggregatedData);
    const series = [
      {
        name: "Pack de Sponsorship",
        data: categories.map((month) => aggregatedData[month].sponsorship),
      },
      {
        name: "Consultation d'Expert",
        data: categories.map(
          (month) => aggregatedData[month].expertConsultation
        ),
      },
    ];

    res.json({ categories, series });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const getAllTransactions = async (req, res) => {
  const sortField = req.query.sortField || "paymentDate";
  const sortOrder = req.query.sortOrder === "1" ? 1 : -1;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    // Count all completed transactions
    const totalTransactionsCount = await Transaction.countDocuments({
      paymentStatus: "completed",
    });

    // Calculate total pages based on the total count
    const totalPages = Math.ceil(totalTransactionsCount / limit);

    // Query completed transactions with populated job
    const transactions = await Transaction.find({
      paymentStatus: "completed",
    })
      .populate("sender", ["Nom", "Prenom"])
      .populate("recipient", ["Nom", "Prenom", "Role"])
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      totalPages,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching completed transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getExpertCompletedTransactions = async (req, res) => {
  const sortField = req.query.sortField || "paymentDate";
  const sortOrder = parseInt(req.query.sortOrder) || -1;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const expertId = req.params.id;

  try {
    // Query completed transactions with populated job
    const transactions = await Transaction.find({
      recipient: expertId,
      paymentStatus: "completed",
    })
      // .populate({
      //   path: "job",
      //   select: "accepted",
      //   match: { accepted: "accepted" },
      // })
      .populate("sender", ["Nom", "Prenom"])
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter transactions where job is populated
    const completedTransactions = transactions.filter(
      (transaction) => transaction.job
    );

    // Count completed transactions separately
    const totalTransactionsCount = completedTransactions.length;

    // Calculate total pages based on the total count
    const totalPages = Math.ceil(totalTransactionsCount / limit);

    res.status(200).json({
      totalPages,
      completedTransactions,
    });
  } catch (error) {
    console.error("Error fetching completed transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getClientCompletedTransactions = async (req, res) => {
  const sortField = req.query.sortField || "paymentDate";
  const sortOrder = parseInt(req.query.sortOrder) || -1;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const clientId = req.params.id;
  try {
    const transactions = await Transaction.find({
      sender: clientId,
      paymentStatus: "completed",
    })
      .populate("recipient", ["Nom", "Prenom", "Role"])
      .populate("sender", ["Nom", "Prenom"])
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalTransactions = transactions.length;

    res.status(200).json({
      totalPages: Math.ceil(totalTransactions / limit),
      transactions,
    });
  } catch (error) {
    console.error("Error fetching completed transactions:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Function to check and update sponsorship status
const checkAndUpdateSponsorshipStatus = async () => {
  const subject = "Mise à jour de votre annonce sponsoriser";
  try {
    const currentDate = new Date();
    console.log("checked sponsorship status");
    const transactions = await Transaction.find({
      sponsorshipStatus: "active",
      expirationDate: { $lt: currentDate },
    }).populate("sender", ["Email"]);

    for (const transaction of transactions) {
      await updateSponsorshipStatus(transaction._id, "expired");
      console.log("expired a sponsored announcement");

      const message = `
Bonjour,
      
Votre sponsorship de type : ${transaction.sponsorship} a expiré le ${new Date(
        transaction.expirationDate
      ).toLocaleDateString()}.
      
Pour renouveler votre sponsorship ou obtenir plus d'informations, veuillez visiter notre site web ou nous contacter.
      
Cordialement,
L'équipe de Support
      `;

      const variables = {
        type: "general notification",
        message: message,
        Date: new Date(Date.now()).toLocaleDateString(),
      };

      await emailSender(transaction.sender.Email, subject, variables);
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

setInterval(checkAndUpdateSponsorshipStatus, 1000 * 60 * 60);

module.exports = {
  getInactivatedSponsorships,
  getExpertCompletedTransactions,
  getClientCompletedTransactions,
  getTransactions,
  getAllTransactions,
};
