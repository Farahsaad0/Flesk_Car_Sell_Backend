const nodemailer = require("nodemailer");

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

// Fonction pour envoyer un e-mail
const sendEmail = async (to, subject, text) => {
  try {
    // Afficher un message de débogage avant l'envoi de l'e-mail
    console.log("Envoi de l'e-mail en cours...");
    // Envoi de l'e-mail
    await transporter.sendMail({
      from: "farah.saad505@gmail.com",
      to: to,
      subject: subject,
      text: text,
    });
    console.log("E-mail envoyé avec succès");
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'e-mail :", error);
    throw new Error("Erreur lors de l'envoi de l'e-mail");
  }
};

module.exports = sendEmail;
