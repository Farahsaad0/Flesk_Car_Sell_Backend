const express = require("express");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");
const uuid = require("uuid");
const Contact = require ("../Models/contact");

let contact = async (req, res) => {
  try {
    console.log('Données reçues du formulaire :', req.body);

    let { Nom, Prénom, Email, Message } = req.body;

    const newContact = new Contact({ Nom, Prénom, Email, Message });
    await newContact.save();

    // Préparez les variables pour l'e-mail
    const subject = "Confirmation de réception de votre message";
    const message = `Bonjour Chèr(e) client , 

    Merci de nous avoir contactés ! 

    Nous avons bien reçu votre message et notre équipe du support client le traite actuellement. Nous reviendrons vers vous dans les plus brefs délais avec une réponse.
    
    
    Merci de votre patience et de votre confiance. 
    
    Cordialement,
    
    L'équipe de FLESK CAR SELL `
    const variables = {
      type: "general notification",
      message,
      date: new Date().toLocaleDateString()
    };

    // Envoyez l'e-mail
    await emailSender(Email, subject, variables); 

    res.json({ message: 'Données enregistrées avec succès et e-mail envoyé !' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Une erreur est survenue lors de l\'enregistrement des données.' });
  }
};
const emailSender = async (email, subject, variables) => {
  //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
  // const subject = "Code de vérification pour votre inscription";
  // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

  try {
    await sendEmail(email, subject, variables);
    console.log("E-mail de notification envoyé avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail de notification :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
  }
};

const getContacts = async (req, res) => {
  try {
      const contacts = await Contact.find();
      res.json(contacts);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Une erreur est survenue lors de la récupération des données.' });
  }
};

  module.exports = {
    contact,
    getContacts,
  }