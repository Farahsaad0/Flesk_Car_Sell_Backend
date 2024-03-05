const express = require("express");
const router = express.Router();
const Expert = require("../Models/expert");



// Mettre à jour la spécialité de l'expert
let updateSpecialite = async (req, res) => {
  try {
    const { spécialité } = req.body;
    const expert = await Expert.findByIdAndUpdate(req.params.id, { spécialité }, { new: true });
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json(expert);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la spécialité de l'expert :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de la spécialité de l'expert." });
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

  // Bloquer un expert
  let bloquerExpert = async (req, res) => {
    try {
      const expert = await Expert.findByIdAndUpdate(req.params.id, { bloqué: true }, { new: true });
      if (!expert) {
        return res.status(404).json({ message: "Expert non trouvé." });
      }
      res.json(expert);
    } catch (error) {
      console.error("Erreur lors du blocage de l'expert :", error);
      res.status(500).json({ message: "Erreur lors du blocage de l'expert." });
    }
  };
// Approuver un expert
let approuverExpert = async (req, res) => {
  try {
    const expert = await Expert.findByIdAndUpdate(req.params.id, { approuvé: true }, { new: true });
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    res.json(expert);
  } catch (error) {
    console.error("Erreur lors de l'approbation de l'expert :", error);
    res.status(500).json({ message: "Erreur lors de l'approbation de l'expert." });
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
    const expert = await Expert.findByIdAndUpdate(req.params.id, updateFields, { new: true });
    
    // Vérification si l'expert existe
    if (!expert) {
      return res.status(404).json({ message: "Expert non trouvé." });
    }
    
    // Réponse avec l'expert mis à jour
    res.json(expert);
  } catch (error) {
    // Gestion des erreurs
    console.error("Erreur lors de la mise à jour de l'expert :", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour de l'expert." });
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
    res.status(500).json({ message: "Erreur lors de la suppression de l'expert." });
  }
};


module.exports = {updateSpecialite, getAllExperts,bloquerExpert,approuverExpert,updateExpert,deleteExpert};


  