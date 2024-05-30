const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");

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
  const templateHtml = await fs.promises.readFile(
    "./views/receipt.handlebars",
    "utf8"
  );
  return handlebars.compile(templateHtml);
};

// Function to read and compile Handlebars Verification Code template
const compileEmailVerificationCode = async () => {
  const templateHtml = await fs.promises.readFile(
    "./views/verificationCode.handlebars",
    "utf8"
  );
  return handlebars.compile(templateHtml);
};

// Function to read and compile Handlebars notification template
const compileEmailNotificationTemplate = async () => {
  const templateHtml = await fs.promises.readFile(
    "./views/notification.handlebars",
    "utf8"
  );
  return handlebars.compile(templateHtml);
};

// Function to read and compile Handlebars notification template
const compileGeneralNotificationTemplate = async () => {
  const templateHtml = await fs.promises.readFile(
    "./views/notification.handlebars",
    "utf8"
  );
  return handlebars.compile(templateHtml);
};

// Fonction pour envoyer un e-mail
const sendEmail = async (to, subject, variables) => {
  try {
    // Afficher un message de débogage avant l'envoi de l'e-mail
    console.log("Envoi de l'e-mail en cours...");

    let html;
    if (variables.type === "expert consultation") {
      const compileNotificationTemplate =
        await compileEmailNotificationTemplate();
      html = compileNotificationTemplate(variables);
    } else if (variables.type === "verification Code") {
      const compileVerificationCode = await compileEmailVerificationCode();
      html = compileVerificationCode(variables);
    } else if (variables.type === "general notification") {
      const compileVerificationCode = await compileGeneralNotificationTemplate();
      html = compileVerificationCode(variables);
    } else {
      const compileTemplate = await compileEmailTemplate();
      html = compileTemplate(variables);
    }

    console.log(variables.type + " << from sendEmail.");
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
