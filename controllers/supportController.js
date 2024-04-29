const Support = require("../Models/support");

// Create a new support ticket
let createSupportTicket = async (req, res) => {
  try {
    const {
      Nom,
      Prénom,
      Email,
      Message,
      Status = "Open",
      Priority = "Low",
    } = req.body;

    if (!Nom || !Prénom || !Email || !Message) {
      return res
        .status(400)
        .json({ success: false, message: "Tous les champs sont requis." });
    }

    // Validate email format (optional)
    if (!isValidEmail(Email)) {
      return res
        .status(400)
        .json({ success: false, message: "Format d'email invalide." });
    }

    const newSupportTicket = new Support({
      Nom,
      Prénom,
      Email,
      Message,
      Status,
      Priority,
    });
    await newSupportTicket.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Ticket de support créé avec succès !",
        supportTicket: newSupportTicket,
      });
  } catch (error) {
    console.error("Erreur lors de la création du ticket de support:", error);
    res
      .status(500)
      .json({
        success: false,
        error:
          "Une erreur est survenue lors de la création du ticket de support.",
      });
  }
};

// Get all support tickets
let getAllSupportTickets = async (req, res) => {
  try {
    const supportTickets = await Support.find();
    res.json(supportTickets);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des tickets de support:",
      error
    );
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération des tickets de support.",
    });
  }
};

// Get a support ticket by ID
let getSupportTicketById = async (req, res) => {
  try {
    const supportTicket = await Support.findById(req.params.id);

    if (!supportTicket) {
      return res.status(404).json({ message: "Ticket de support non trouvé." });
    }

    res.json(supportTicket);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du ticket de support par ID:",
      error
    );
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la récupération du ticket de support.",
    });
  }
};

// Update a support ticket by ID
let updateSupportTicket = async (req, res) => {
  try {
    const { Nom, Prénom, Email, Message, Status, Priority } = req.body;

    if (!Nom || !Prénom || !Email || !Message) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    const supportTicket = await Support.findByIdAndUpdate(
      req.params.id,
      { Nom, Prénom, Email, Message, Status, Priority },
      { new: true }
    );

    if (!supportTicket) {
      return res.status(404).json({ message: "Ticket de support non trouvé." });
    }

    res.json({
      message: "Ticket de support mis à jour avec succès !",
      supportTicket,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du ticket de support:", error);
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la mise à jour du ticket de support.",
    });
  }
};

// Delete a support ticket by ID
let deleteSupportTicket = async (req, res) => {
  try {
    const supportTicket = await Support.findByIdAndDelete(req.params.id);

    if (!supportTicket) {
      return res.status(404).json({ message: "Ticket de support non trouvé." });
    }

    res.json({ message: "Ticket de support supprimé avec succès !" });
  } catch (error) {
    console.error("Erreur lors de la suppression du ticket de support:", error);
    res.status(500).json({
      error:
        "Une erreur est survenue lors de la suppression du ticket de support.",
    });
  }
};

// Add a new chat message to a support ticket
let addChatMessage = async (req, res) => {
  try {
    const { sender, message } = req.body;

    if (!sender || !message) {
      return res
        .status(400)
        .json({ message: "Sender and message are required." });
    }

    const supportTicket = await Support.findById(req.params.id);

    if (!supportTicket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    supportTicket.chat.push({ sender, message });
    await supportTicket.save();

    res.json({ message: "Chat message added successfully!", supportTicket });
  } catch (error) {
    console.error("Error adding chat message:", error);
    res
      .status(500)
      .json({ error: "An error occurred while adding the chat message." });
  }
};

// Get all chat messages for a support ticket
let getAllChatMessages = async (req, res) => {
  try {
    const supportTicket = await Support.findById(req.params.id);

    if (!supportTicket) {
      return res.status(404).json({ message: "Support ticket not found." });
    }

    const chatMessages = supportTicket.chat;
    res.json(chatMessages);
  } catch (error) {
    console.error("Error getting chat messages:", error);
    res
      .status(500)
      .json({ error: "An error occurred while getting chat messages." });
  }
};

const isValidEmail = (email) => {
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  createSupportTicket,
  getAllSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  deleteSupportTicket,
  addChatMessage,
  getAllChatMessages,
};
