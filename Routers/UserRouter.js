const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/User");
const { generateLogToken } = require("../utils");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");
// Route de création d'utilisateur
let register = async (req, res) => {
  try {
    let { Email, Nom, Prenom, Password, Role } = req.body;
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).send({ message: "Utilisateur est déjà existé!" });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      Nom: Nom,
      Prenom: Prenom,
      Email: Email,
      Password: await bcrypt.hash(Password, 10),
      Role: Role,
    });
    console.log("newUser------>", newUser);
    if (newUser.length == 0) {
      res.status(500).send(error);
    }
    // Enregistrer le nouvel utilisateur dans la base de données
    await newUser.save();

    // Générer un code de vérification
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Génère un nombre aléatoire à 6 chiffres

    // Enregistrer le code de vérification dans la base de données pour l'utilisateur nouvellement créé
    // newUser.Verified_code = verificationCode;
    // await newUser.save();

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
    if (!user || user.Verified_code !== verificationCode) {
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

module.exports = { login, register, verifyRouteHandler };
