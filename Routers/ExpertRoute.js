const express = require("express");
const router = express.Router();
const Expert = require("../Models/expert");
const User = require("../Models/User");
const sendEmail = require("../utils/sendEmail");

// Mettre à jour la spécialité de l'expert
let updateSpecialite = async (req, res) => {
  try {
    const { spécialité } = req.body;
    const expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { spécialité },
      { new: true }
    );
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json(expert);
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour de la spécialité de l'expert :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la mise à jour de la spécialité de l'expert.",
    });
  }
};

// Récupérer tous les experts
let getAllExperts = async (req, res) => {
  try {
    const experts = await Expert.find();
    res.json(experts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

let getApprovedExperts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 50;

    const totalExperts = await User.countDocuments({
      Role: "Expert",
      Statut: "Approuvé",
    });
    const totalPages = Math.ceil(totalExperts / perPage);

    const approvedExperts = await User.find({
      Role: "Expert",
      Statut: "Approuvé",
    })
      .populate("ExpertId") // Populate the ExpertId field to fetch related data from the expert collection
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.status(200).json({ approvedExperts, totalPages });
  } catch (error) {
    console.error("Erreur lors de la récupération des experts :", error);
    res.status(500).json({
      error: "Erreur lors de la récupération des experts : " + error,
    });
  }
};

// Bloquer un expert
// let bloquerExpert = async (req, res) => {
//   const subject = "mise a jour de votre compte";
//   const message = "Nous vous informons que votre compte utilisateur a été bloqué. Veuillez noter que cette mesure a été prise pour des raisons de sécurité ou de non-conformité avec nos conditions d'utilisation.";

//   try {
//     const expert = await Expert.findByIdAndUpdate(
//       req.params.id,
//       { bloqué: true },
//       { new: true }
//     );
//     if (!expert) {
//       return res.status(404).json({ message: "Expert non trouvé." });
//     }
//     res.json(expert);

//     await emailSander(expert.Email, subject, message)
//   } catch (error) {
//     console.error("Erreur lors du blocage de l'expert :", error);
//     res.status(500).json({ message: "Erreur lors du blocage de l'expert." });
//   }
// };

// Approuver un expert
// let approuverExpert = async (req, res) => {
//   try {
//     const expert = await Expert.findByIdAndUpdate(req.params.id, { approuvé: true }, { new: true });
//     if (!expert) {
//       return res.status(404).json({ message: "Expert non trouvé." });
//     }
//     res.json(expert);
//   } catch (error) {
//     console.error("Erreur lors de l'approbation de l'expert :", error);
//     res.status(500).json({ message: "Erreur lors de l'approbation de l'expert." });
//   }
// };

let approuverExpert = async (req, res) => {
  const subject = "mise a jour de votre demand d'un compte expert";
  const message = `Votre demand a etes accepter, Vous pouvez connecter est etuliser votre compte comme un expert`;

  try {
    const expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { approuvé: true },
      { new: true }
    );
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json(expert);

    // Update the corresponding User's Statut to "Approuvé"
    const updatedExpert = await User.findOneAndUpdate(
      { ExpertId: req.params.id },
      { Statut: "Approuvé" }
    );

    await emailSander(updatedExpert.Email, subject, message);
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'expert :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'approbation de l'expert." });
  }
};

let rejeterExpert = async (req, res) => {
  const subject = "mise a jour de votre demand d'un compte expert";
  const message =
    "Nous tenons à vous informer que votre demande a été rejetée. Nous comprenons que cela puisse être décevant, mais nous vous encourageons à ne pas vous inquiéter. Vous pouvez toujours accéder à votre compte et l'utiliser comme tout autre utilisateur.";

  try {
    const expert = await Expert.findByIdAndUpdate(
      req.params.id,
      { approuvé: false },
      { new: true }
    );
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json(expert);

    // Update the corresponding User's Statut to "Rejeté"
    const updatedExpert = await User.findOneAndUpdate(
      { ExpertId: req.params.id },
      { Statut: "Rejeté" }
    );

    await emailSander(updatedExpert.Email, subject, message);
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'expert :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de l'approbation de l'expert." });
  }
};

// Fonction pour mettre à jour un expert
let updateExpert = async (req, res) => {
  try {
    // Extraction des champs à mettre à jour à partir du corps de la requête
    const { spécialité, bloqué, approuvé } = req.body;

    // Initialisation d'un objet pour stocker les champs à mettre à jour
    const updateFields = {};

    // Vérification de chaque champ et ajout à l'objet updateFields s'il est présent dans la requête
    if (spécialité) updateFields.spécialité = spécialité;
    if (bloqué !== undefined) updateFields.bloqué = bloqué;
    if (approuvé !== undefined) updateFields.approuvé = approuvé;

    // Recherche de l'expert par ID et mise à jour des champs spécifiés
    const expert = await Expert.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
    });

    // Vérification si l'expert existe
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }

    // Réponse avec l'expert mis à jour
    res.json(expert);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la mise à jour de l'expert :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour de l'expert." });
  }
};

// Fonction pour supprimer un expert
let deleteExpert = async (req, res) => {
  try {
    // Recherche de l'expert par ID et suppression
    const expert = await Expert.findByIdAndDelete(req.params.id);

    // Vérification si l'expert existe
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }

    // Réponse avec l'expert supprimé
    res.json(expert);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la suppression de l'expert :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression de l'expert." });
  }
};

const emailSander = async (email, subject, message) => {  //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
  // const subject = "Code de vérification pour votre inscription";
  // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

  try {
    await sendEmail(email, subject, message);
    console.log("E-mail de notification envoyé avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail de notification :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
  }
};

module.exports = {
  updateSpecialite,
  getAllExperts,
  // bloquerExpert,
  approuverExpert,
  updateExpert,
  deleteExpert,
  rejeterExpert,
  getApprovedExperts,
};
