const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const ExpertProfile = require("../Models/expert");
const { generateLogToken } = require("../utils");
const { verifyToken } =require("../utils");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");

// Route de création d'utilisateur
let register = async (req, res) => {
  try {
    let { Email, Nom, Prenom, Password, Role, Spécialité } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ Email })
    if (existingUser) {
      return res.status(409).send({ message: "Utilisateur est déjà existé!" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const newUser = new User({
      Nom: Nom,
      Prenom: Prenom,
      Email: Email,
      Password: await bcrypt.hash(Password, 10),
      Role: Role,
      Verified_code: verificationCode,
      Statut: Role.toLowerCase() === "expert" ? "En attente" : "Approuvé",
    });

    await newUser.save();

    if (Role.toLowerCase() === "expert") {
      const newExpert = new ExpertProfile({
        spécialité: Spécialité,
      });
      await newExpert.save();
      newUser.ExpertId = newExpert._id;
      await newUser.save();

      // Envoi du code de vérification par e-mail pour les experts
      await sendVerificationEmail(newUser.Email, verificationCode);
    } else {
      // Envoi du code de vérification par e-mail pour les utilisateurs standards
      await sendVerificationEmail(newUser.Email, verificationCode);
    }

    res.status(201).json({ user: newUser });
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
// let login = async (req, res) => {
//   try {
//     const user = await User.findOne({ Email: req.body.Email });
//     if (!user) {
//       return res.status(400).send("Utilisateur non trouvé");
//     }

//     if (user.Role === "expert" && user.Statut === "En attente") {
//       return res.status(401).send("Votre compte est en attente d'approbation par l'administrateur");
//     }

//     const passwordMatch = await bcrypt.compare(
//       req.body.Password,
//       user.Password
//     );
//     if (!passwordMatch) {
//       return res.status(401).send("Invalid password");
//     }

//     const token = generateLogToken(user);

//     res.send({
//       _id: user._id,
//       Nom: user.Nom,
//       Prenom: user.Prenom,
//       Email: user.Email,
//       Role: user.Role,
//       token: token,
//     });
//   } catch (error) {
//     console.error("Erreur lors de la connexion de l'utilisateur :", error);
//     res.status(500).send("Erreur lors de la connexion de l'utilisateur");
//   }
// };

let login = async (req, res) => {
  try {
    const { Email, Password } = req.body;

    // Find the user by email
    const user = await User.findOne({ Email });

    // If user doesn't exist, return error
    if (!user) {
      return res.status(400).send("Utilisateur non trouvé");
    }

    // Check if the user's account is pending approval
    if (user.Role === "expert" && user.Statut === "En attente") {
      return res
        .status(401)
        .send("Votre compte est en attente d'approbation par l'administrateur");
    }

    // Compare the provided password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(Password, user.Password);

    // If passwords don't match, return error
    if (!passwordMatch) {
      return res.status(401).send("Mot de passe incorrect");
    }

    // If everything is correct, generate token and send user data with token
    const token = generateLogToken(user);

    // Include the user ID in the response
    res.json({
      _id: user._id, // Include the user ID in the response
      Nom: user.Nom,
      Prenom: user.Prenom,
      Email: user.Email,
      Role: user.Role,
      token: token,
      Statut: user.Statut,
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

    const users = await User.find({} , '-Password -__v -Verified_code')
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
    res.status(500).json({
      error: "Erreur lors de la récupération des experts en attente : " + error,
    });
  }
};

let blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    user.Statut = "Bloqué"; 

    await user.save();

    res.status(200).json({ message: "User blocked successfully." });
  } catch (error) {
    console.error("Error blocking user:", error);
    res.status(500).json({ error: "Error blocking user: " + error });
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
  login,
  register,
  verifyRouteHandler,
  getAllUsers,
  getPendingExperts,
  getUserById,
  blockUser,
  unblockUser,
  getUserData,
  updateUserData ,
};
