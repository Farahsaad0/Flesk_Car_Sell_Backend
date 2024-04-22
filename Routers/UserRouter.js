const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const ExpertProfile = require("../Models/expert");
const { generateLogToken } = require("../utils");
const { verifyToken } = require("../utils");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");

// Route de création d'utilisateur
let register = async (req, res) => {
  try {
    let { Email, Nom, Prenom, Password, Role, Numéro , Adresse , Spécialité, prix, experience } =
      req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).send({ message: "Utilisateur déjà existant!" });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const newUser = new User({
      Nom: Nom,
      Prenom: Prenom,
      Email: Email,
      Password: await bcrypt.hash(Password, 10),
      Role: Role,
      Numéro : Numéro,
      Adresse : Adresse,
      Verified_code: verificationCode,
      Statut: Role.toLowerCase() === "expert" ? "En attente" : "Approuvé",
    });

    await newUser.save();

    const subject = "Code de vérification pour votre inscription";
    const message = `Nous sommes ravis de vous voir sur le point de finaliser votre inscription! Votre code de vérification est le suivant : ${verificationCode} . Utilisez ce code pour compléter le processus d'inscription.`;

    if (Role.toLowerCase() === "expert") {
      const newExpert = new ExpertProfile({
        spécialité: Spécialité,
        prix: prix,
        experience: experience,
      });
      await newExpert.save();
      newUser.ExpertId = newExpert._id;
      await newUser.save();

      // Envoi du code de vérification par e-mail pour les experts
      await emailSander(newUser.Email, subject, message);
    } else {
      // Envoi du code de vérification par e-mail pour les utilisateurs standards
      await emailSander(newUser.Email, subject, message);
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
const emailSander = async (email, subject, message) => {
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
      Numéro : user.Numéro,
      Adresse : user.Adresse,
      Verified: user.Verified,
      token: token,
      Statut: user.Statut,
    });
  } catch (error) {
    console.error("Erreur lors de la connexion de l'utilisateur :", error);
    res.status(500).send("Erreur lors de la connexion de l'utilisateur");
  }
};

// Définition de la fonction pour renvoyer les données de l'utilisateur
let getUserData = async (req, res) => {
  try {
    const userId = req.params.id;

    // Trouver l'utilisateur par son ID dans la base de données
    const user = await User.findById(userId);

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
      Numéro : user.Numéro,
      Adresse : user.Adresse,
      Role: user.Role,
      Statut: user.Statut,
      photo: user.photo,
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

/*let updateUserData = async (req, res) => {
  try {
    if (req.file) {
      const { filename } = req.file;
      req.body.photo = filename;
    }
    // Si le token est valide, récupérer l'ID de l'utilisateur à partir du token décodé
    const userId = req.params.id;

    // Vérifier si le nouveau mot de passe est présent dans les données de la requête
    if (req.body.Password) {
      // Hacher le nouveau mot de passe
      const hashedPassword = await bcrypt.hash(req.body.Password, 10); // Utilisez une valeur de coût appropriée

      // Remplacer le mot de passe en texte clair par le mot de passe haché dans les données de la requête
      req.body.Password = hashedPassword;
    }

    // Vérifier si le rôle a été modifié en "Expert"
    // if (req.body.Role === "Expert") {
    // Si le rôle a été changé en "Expert", définir le statut sur "En attente"
    // req.body.Statut = "En attente";
    // }

    // Trouver et mettre à jour l'utilisateur par son ID dans la base de données
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    // Si l'utilisateur n'existe pas, retourner une erreur
    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Retourner les données de l'utilisateur mises à jour sous forme de réponse JSON
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
    console.error(
      "Erreur lors de la mise à jour des données utilisateur :",
      error
    );
    res
      .status(500)
      .send("Erreur lors de la mise à jour des données utilisateur");
  }
}; */

const updateUserData = async (req, res) => {
  try {
    // Vérifier si une photo a été téléchargée
    let photo;
    if (req.file) {
      // Stocker l'URL de la photo dans une variable
      photo = req.file.filename;
    }

    // Extraire le token d'authentification de l'en-tête de la requête
    // const token = req.headers.authorization.split(" ")[1]; // Supposons que le token soit envoyé dans le format 'Bearer token'

    // Vérifier et décoder le token
    // const decodedToken = verifyToken(token);

    // Si le token est valide, récupérer l'ID de l'utilisateur à partir du token décodé
    const userId = req.params.id;

    // Vérifier si le nouveau mot de passe est présent dans les données de la requête
    // if (req.body.Password) {
      // Hacher le nouveau mot de passe
      // const hashedPassword = await bcrypt.hash(req.body.Password, 10); // Utilisez une valeur de coût appropriée

      // Remplacer le mot de passe en texte clair par le mot de passe haché dans les données de la requête
      // req.body.Password = hashedPassword;
    // }

    // Vérifier si le rôle a été modifié en "Expert"
    // if (req.body.Role === "Expert") {
      // Si le rôle a été changé en "Expert", définir le statut sur "En attente"
      // req.body.Statut = "En attente";
    // }

    // Si une URL de photo existe, ajoutez-la aux données de la requête
    if (photo) {
      req.body.photo = photo; 
    }

    // Trouver et mettre à jour l'utilisateur par son ID dans la base de données
    const updatedUser = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
    });

    // Si l'utilisateur n'existe pas, retourner une erreur
    if (!updatedUser) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Retourner les données de l'utilisateur mises à jour sous forme de réponse JSON
    res.json({
      _id: updatedUser._id,
      Nom: updatedUser.Nom,
      Prenom: updatedUser.Prenom,
      Email: updatedUser.Email,
      Role: updatedUser.Role,
      Statut: updatedUser.Statut,
      photo: updatedUser.photo, // Retourner l'URL de la photo mise à jour
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des données utilisateur :",
      error
    );
    res
      .status(500)
      .send("Erreur lors de la mise à jour des données utilisateur");
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
    await emailSander(user.Email, subject, message);

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
  login,
  register,
  verifyRouteHandler,
  getAllUsers,
  getPendingExperts,
  getUserById,
  getUserData,
  updateUserData,
  blockUser,
  unblockUser,
  
};
