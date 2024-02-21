const express = require("express");

const bcrypt = require("bcrypt");
const User = require("../Models/User");
const { generateLogToken } = require("../utils");

// Route de création d'utilisateur
let register = async (req, res) => {
  try {
    let { Email, Nom, Prenom, Password, Role } = req.body;
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).send("Utilisateur est déjà existé!");
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

    // Renvoyer les détails de l'utilisateur nouvellement créé
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res
      .status(500)
      .send("Erreur lors de la création de l'utilisateur " + error);
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

module.exports = { login, register };
