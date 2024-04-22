const express = require("express");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");
const Contact = require ("../Models/contact");

let contact = async (req, res) => {
    try {
        // Log des données reçues depuis le formulaire
        console.log('Données reçues du formulaire :', req.body);
        
        let { Nom, Prénom, Email, Message } = req.body;
        
        const newContact = new Contact({ Nom, Prénom, Email, Message });
        await newContact.save();
        
        res.json({ message: 'Données enregistrées avec succès !' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue lors de l\'enregistrement des données.' });
    }
};

  module.exports = {
    contact,
  }