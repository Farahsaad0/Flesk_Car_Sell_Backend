const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");
const Expert = require("../Models/expert");

// Fonction pour envoyer un e-mail de vérification
const emailSender = async (email, subject, message) => {
  //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
  try {
    await sendEmail(email, subject, message);
    console.log("E-mail de vérification envoyé avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail de vérification :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'e-mail de vérification");
  }
};

// Route pour valider le code de vérification et finaliser l'inscription
let verifyRouteHandler = async (req, res) => {
  try {
    let { email, verificationCode } = req.body;

    // Recherche de l'utilisateur dans la base de données
    let user = await User.findOne({ Email: email });

    // Vérification du code de vérification
    if (!user || user.Verified_code !== parseInt(verificationCode)) {
      return res
        .status(400)
        .json({ message: "Code de vérification invalide." });
    }

    // Marquer l'utilisateur comme vérifié
    user.Verified = true;

    await user.save();

    // Répondre avec un message de succès
    res.status(200).json({ message: "Inscription finalisée avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du code de vérification :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la vérification du code de vérification.",
    });
  }
};

// Définition de la fonction pour renvoyer les données de l'utilisateur
let getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Trouver l'utilisateur par son ID dans la base de données
    const user = await User.findById(userId).populate("ExpertId");

    // Si l'utilisateur n'existe pas, retourner une erreur
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Retourner les données de l'utilisateur sous forme de réponse JSON
    res.json({
      _id: user._id,
      Nom: user.Nom,
      Prenom: user.Prenom,
      Email: user.Email,
      Numéro: user.Numéro,
      Adresse: user.Adresse,
      Role: user.Role,
      Statut: user.Statut,
      photo: user.photo,
      experience: user.ExpertId?.experience,
      prix: user.ExpertId?.prix,
      spécialité: user.ExpertId?.spécialité,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données utilisateur :",
      error
    );
    res
      .status(500)
      .send("Erreur lors de la récupération des données utilisateur");
  }
};

const updateUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const { oldPassword, newPassword, Role, ...userData } = req.body;

    if (user.Role === "Expert") {
      const { spécialité, prix, experience } = req.body;
      // Only update expert-specific fields
      await Expert.findByIdAndUpdate(user.ExpertId, { spécialité, prix, experience });
    }
    // Check if old password is correct
    if (!(await bcrypt.compare(oldPassword, user.Password))) {
      return res.status(400).send("Old password is incorrect");
    }
    let updatedUserData = { ...userData };
    if (req.file) {
      updatedUserData.photo = req.file.filename;
    }
    if (newPassword) {
      // Regular expression pattern for password format (at least 8 characters, at least one uppercase letter, one lowercase letter, one number, and one special character)
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

      // Validate new password against the regex pattern
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).send("New password does not meet requirements");
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updatedUserData.Password = hashedPassword;
    }
    const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    });
    res.json({
      _id: updatedUser._id,
      Nom: updatedUser.Nom,
      Prenom: updatedUser.Prenom,
      Email: updatedUser.Email,
      Role: updatedUser.Role,
      Statut: updatedUser.Statut,
      photo: updatedUser.photo,
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).send("Error updating user data");
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const search = req.query.search || "";
    const sortField = req.query.sortField || "JoinDate";
    const sortOrder = parseInt(req.query.sortOrder) || -1;
    const filter = req.query.filter || "all";

    const query = {};
    if (search) {
      query["$or"] = [
        { Nom: { $regex: search, $options: "i" } },
        { Prenom: { $regex: search, $options: "i" } },
        { Email: { $regex: search, $options: "i" } },
      ];
    }
    if (filter !== "all") {
      query.Statut = filter; // Filter by status
    }

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / perPage);

    const users = await User.find(query)
      .sort({ [sortField]: sortOrder }) // Sort based on the provided field and order
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ users, totalPages });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users: " + error.message });
  }
};

let getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user information:", error);
    res
      .status(500)
      .json({ error: "Error fetching user information: " + error });
  }
};

let getPendingExperts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalExperts = await User.countDocuments({
      Role: "Expert",
      Statut: "En attente",
    });
    const totalPages = Math.ceil(totalExperts / perPage);

    const pendingExperts = await User.find({
      Role: "Expert",
      Statut: "En attente",
    })
      .populate("ExpertId") // Populate the ExpertId field to fetch related data from the expert collection
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ pendingExperts, totalPages });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des experts en attente :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la récupération des experts en attente : " + error,
    });
  }
};

let blockUser = async (req, res) => {
  const subject = "Mise à jour de votre compte";
  const message =
    "Nous vous informons que votre compte utilisateur a été bloqué. Veuillez noter que cette mesure a été prise pour des raisons de sécurité ou de non-conformité avec nos conditions d'utilisation.";

  try {
    const userId = req.params.id;

    // const user = await User.findById(userId);
    const user = await User.findByIdAndUpdate(userId, {
      Statut: "Bloqué",
    });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // user.Statut = "Bloqué";

    // await user.save();
    await emailSender(user.Email, subject, message);

    res.status(200).json({ message: "Utilisateur bloqué avec succès." });
  } catch (error) {
    console.error("Erreur lors du blocage de l'utilisateur : ", error);
    res
      .status(500)
      .json({ error: "Erreur lors du blocage de l'utilisateur : " + error });
  }
};

let unblockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.Statut = "Approuvé";

    await user.save();

    res.status(200).json({ message: "User unblocked successfully." });
  } catch (error) {
    console.error("Error unblocking user:", error);
    res.status(500).json({ error: "Error unblocking user: " + error });
  }
};

module.exports = {
  // login,
  // register,
  verifyRouteHandler,
  getAllUsers,
  getPendingExperts,
  getUserById,
  getUserData,
  updateUserData,
  blockUser,
  unblockUser,
};
