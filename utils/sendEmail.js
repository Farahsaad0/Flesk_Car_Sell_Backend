const nodemailer = require("nodemailer");
const handlebars = require('handlebars');
const fs = require('fs');

// Créer un transporter SMTP réutilisable
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "farah.saad505@gmail.com",
    pass: "hlue fmyz cjbh mdkq",
  },
});

// Function to read and compile Handlebars template
const compileEmailTemplate = async () => {
  const templateHtml = await fs.promises.readFile('./views/receipt.handlebars', 'utf8');
  return handlebars.compile(templateHtml);
};


// Fonction pour envoyer un e-mail
const sendEmail = async (to, subject, variables) => {
  try {
    // Afficher un message de débogage avant l'envoi de l'e-mail
    console.log("Envoi de l'e-mail en cours...");
    
    const compileTemplate = await compileEmailTemplate();

    const html = compileTemplate(variables);

    // Envoi de l'e-mail
    await transporter.sendMail({
      from: "farah.saad505@gmail.com",
      to: to,
      subject: subject,
      html: html,
    });
    console.log("E-mail envoyé avec succès");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    throw new Error("Erreur lors de l'envoi de l'e-mail");
  }
};

module.exports = sendEmail;
