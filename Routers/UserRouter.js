const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const ExpertProfile = require("../Models/expert")
const { generateLogToken } = require("../utils");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");

// Route de création d'utilisateur
let register = async (req, res) => {
  try {
    let { Email, Nom, Prenom, Password, Role, Spécialité } = req.body; // Add Spécialité to the request body
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).send({ message: "Utilisateur est déjà existé!" });
    }

    // Générer un code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Génère un nombre aléatoire à 6 chiffres

    // Créer un nouvel utilisateur
    const newUser = new User({
      Nom: Nom,
      Prenom: Prenom,
      Email: Email,
      Password: await bcrypt.hash(Password, 10),
      Role: Role,
      Verified_code: verificationCode, // Attribution du code de vérification
      Statut: Role.toLowerCase() === "expert" ? "En attente" : "Approuvé", // Initialiser les experts comme "En attente"
    });

    // Save the user to the database
    await newUser.save();

    // If the user role is Expert, create a new expert profile and link it to the user
    if (Role.toLowerCase() === "expert") {
      const newExpert = new ExpertProfile({
        spécialité: Spécialité,
      });
      await newExpert.save();
      newUser.ExpertId = newExpert._id; // Link the expert profile to the user
      await newUser.save();
    }

    // Enregistrer le code de vérification dans la base de données pour l'utilisateur nouvellement créé
    newUser.Verified_code = verificationCode;
    await newUser.save();

    // Envoyer le code de vérification par e-mail
    await sendVerificationEmail(newUser.Email, verificationCode);

    // Renvoyer les détails de l'utilisateur nouvellement créé
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res
      .status(500)
      .send("Erreur lors de la création de l'utilisateur " + error);
  }
};


// Fonction pour envoyer un e-mail de vérification
const sendVerificationEmail = async (email, code) => {
  const subject = "Code de vérification pour votre inscription";
  const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

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

// Route de connexion
let login = async (req, res) => {
  try {
    const user = await User.findOne({ Email: req.body.Email });
    if (!user) {
      return res.status(400).send("Utilisateur non trouvé");
    }

    if (user.Role === "expert" && user.Statut === "En attente") {
      return res.status(401).send("Votre compte est en attente d'approbation par l'administrateur");
    }

    const passwordMatch = await bcrypt.compare(
      req.body.Password,
      user.Password
    );
    if (!passwordMatch) {
      return res.status(401).send("Invalid password");
    }

    const token = generateLogToken(user);

    res.send({
      _id: user._id,
      Nom: user.Nom,
      Prenom: user.Prenom,
      Email: user.Email,
      Role: user.Role,
      token: token,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    res.status(500).send("Erreur lors de la connexion de l'utilisateur");
  }
};

let getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameters
    const perPage = parseInt(req.query.perPage) || 10; // Get the number of items per page from the query parameters, default to 10 if not provided

    const totalUsers = await User.countDocuments(); // Count total number of users
    const totalPages = Math.ceil(totalUsers / perPage); // Calculate total number of pages

    const users = await User.find()
      .skip((page - 1) * perPage) // Skip users based on the current page number and items per page
      .limit(perPage); // Limit the number of users returned per page

    res.status(200).json({ users, totalPages }); // Return users data along with total number of pages
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Error fetching users: " + error });
  }
};

// let getPendingExperts = async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Get the requested page number from the query parameters
//     const perPage = parseInt(req.query.perPage) || 10; // Get the number of items per page from the query parameters, default to 10 if not provided

//     const totalExperts = await User.countDocuments({ Verified: false }); // Count total number of pending experts
//     const totalPages = Math.ceil(totalExperts / perPage); // Calculate total number of pages

//     const pendingExperts = await User.find({ Verified: false })
//       .skip((page - 1) * perPage) // Skip experts based on the current page number and items per page
//       .limit(perPage); // Limit the number of experts returned per page

//     res.status(200).json({ pendingExperts, totalPages }); // Send pending experts and total pages in the response
//   } catch (error) {
//     console.error(
//       "Erreur lors de la récupération des experts en attente :",
//       error
//     );
//     res
//       .status(500)
//       .json({
//         error:
//           "Erreur lors de la récupération des experts en attente : " + error,
//       });
//   }
// };


let getPendingExperts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;

    const totalExperts = await User.countDocuments({ Role: "Expert", Statut: "En attente" });
    const totalPages = Math.ceil(totalExperts / perPage);

    const pendingExperts = await User.find({ Role: "Expert", Statut: "En attente" })
      .populate("ExpertId") // Populate the ExpertId field to fetch related data from the expert collection
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ pendingExperts, totalPages });
  } catch (error) {
    console.error("Erreur lors de la récupération des experts en attente :", error);
    res.status(500).json({ error: "Erreur lors de la récupération des experts en attente : " + error });
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
    res.status(500).json({ error: "Error fetching user information: " + error });
  }
};

module.exports = {
  login,
  register,
  verifyRouteHandler,
  getAllUsers,
  getPendingExperts,
  getUserById,
};
