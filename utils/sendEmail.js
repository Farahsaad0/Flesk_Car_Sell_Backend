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
    "./views/generalNotification.handlebars",
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

module.exports = emailSender;
