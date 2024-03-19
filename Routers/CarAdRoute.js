const express = require("express");
const router = express.Router();
const CarAd = require("../Models/carAd");
const User = require("../Models/User"); 

// Route pour la création d'une nouvelle annonce de voiture
const createCarAd = async (req, res) => {
  try {
    const {
      titre,
      description,
      prix,
      modele,
      annee,
      marque,
      date,
      photo,
      sponsorship,
      userId // Nouveau champ pour l'ID de l'utilisateur
    } = req.body;

    // Vérifie si l'utilisateur existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Crée une nouvelle instance de CarAd
    const newCarAd = new CarAd({
      titre,
      description,
      prix,
      modele,
      annee,
      marque,
      date,
      photo,
      sponsorship,
      utilisateur: userId // Associe l'annonce à l'utilisateur
    });

    // Enregistre la nouvelle annonce dans la base de données
    const ad = await newCarAd.save();

   // Générer l'URL complet de l'image
const imageUrl = req.protocol + '://' + req.get('host') + '/public/uploads/' + ad.photo;

    // Mettre à jour l'annonce avec l'URL de l'image
    ad.photo = imageUrl;
    await ad.save();

    console.log("Annonce créée avec succès :", ad);
    res.status(201).json(ad); // Renvoie la nouvelle annonce créée en tant que réponse
  } catch (error) {
    console.error("Erreur lors de la création de l'annonce :", error);
    res.status(500).json({ error: "Erreur lors de la création de l'annonce " + error }); // Renvoie une erreur en cas d'échec
  }
};

// récupérer toutes les annonces de voiture
let getAllCarAds = async (req, res) => {
  try {
    const ads = await CarAd.find();
    res.status(200).json(ads); // Renvoie toutes les annonces
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des annonces " + error });
  }
}; 

//  modifier une annonce de voiture
let updateCarAd = async (req, res) => {
  try {
    const {
      titre,
      description,
      prix,
      marque,
      modele,
      annee,
      date,
      photo,
      sponsorship,
    } = req.body;
    const { id } = req.params;

    const ad = await CarAd.findByIdAndUpdate(
      id,
      {
        titre,
        description,
        prix,
        marque,
        modele,
        annee,
        date,
        photo,
        sponsorship,
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ error: "Annonce non trouvée" });
    }

    console.log("Annonce modifiée avec succès :", ad);
    res.status(200).json(ad);
  } catch (error) {
    console.error("Erreur lors de la modification de l'annonce :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la modification de l'annonce " + error });
  }
};
// supprimer une annonce de voiture
let deleteCarAd = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await CarAd.findByIdAndDelete(id);
    if (!ad) {
      return res.status(404).json({ error: "Annonce non trouvée" });
    }

    console.log("Annonce supprimée avec succès :", ad);
    res.status(200).json(ad);
  } catch (error) {
    console.error("Erreur lors de la suppression de l'annonce :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la suppression de l'annonce " + error });
  }
};

//  récupérer une seule annonce de voiture par son ID
let getCarAdById = async (req, res) => {
  try {
    const { id } = req.params;

    const ad = await CarAd.findById(id);
    if (!ad) {
      return res.status(404).json({ error: "Annonce non trouvée" });
    }
    res.status(200).json(ad);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'annonce :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'annonce " + error });
  }
};

// rechercher des annonces de voiture en fonction de certains critères
let searchCarAds = async (req, res) => {
  try {
    const { marque, modele, anneeFrom, anneeTo, prixFrom, prixTo } = req.query;
    let query = {};

    // Filtrer par marque
    if (marque) {
      query.make = marque;
    }

    // Filtrer par modèle
    if (modele) {
      query.model = modele;
    }

    // Filtrer par année (intervalle)
    if (anneeFrom && anneeTo) {
      query.annee = { $gte: anneeFrom, $lte: anneeTo };
    } else if (anneeFrom) {
      query.annee = { $gte: anneeFrom };
    } else if (anneeTo) {
      query.annee = { $lte: anneeTo };
    }

    // Filtrer par prix (intervalle)
    if (prixFrom && prixTo) {
      query.prix = { $gte: prixFrom, $lte: prixTo };
    } else if (prixFrom) {
      query.prix = { $gte: prixFrom };
    } else if (prixTo) {
      query.prix = { $lte: prixTo };
    }

    // Recherche des annonces de voiture en fonction des critères spécifiés
    const ads = await CarAd.find(query);
    res.status(200).json(ads); // Renvoie les annonces correspondantes
  } catch (error) {
    console.error(
      "Erreur lors de la recherche des annonces de voiture :",
      error
    );
    res
      .status(500)
      .json({
        error: "Erreur lors de la recherche des annonces de voiture " + error,
      });
  }
};

module.exports = {
  createCarAd,
  getAllCarAds,
  updateCarAd,
  deleteCarAd,
  getCarAdById,
  searchCarAds,
};
