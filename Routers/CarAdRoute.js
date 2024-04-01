const express = require("express");
const router = express.Router();
const CarAd = require("../Models/carAd");
const User = require("../Models/User");
const upload = require("../multer-config"); // Importer multer-config

// Route pour la création d'une nouvelle annonce de voiture
// const createCarAd = async (req, res) => {
//   try {
//     // Utilisez Multer pour gérer le téléchargement d'images avec l'objet "upload" déjà importé
//     upload.single('photo')(req, res, async (err) => {
//       if (!req.file) {
//         return res.status(400).json({ error: "Aucune photo téléchargée." });
//       }

//       if (err) {
//         console.error("Erreur lors du téléchargement du fichier :", err);
//         return res.status(500).json({ error: "_Erreur lors du téléchargement du fichier " + err.message });
//       }

//       // Le code suivant doit être exécuté une fois que le middleware Multer a terminé le traitement du fichier téléchargé
//       // Obtenez les données du corps de la demande
//       const { titre, description, prix, modele, annee, marque, date, sponsorship, userId } = req.body;

//       // Valider les champs requis
//       if (!titre || !description || !prix || !modele || !annee || !marque || !date || !userId) {
//         return res.status(400).json({ error: "Tous les champs sont obligatoires." });
//       }

//       // Vérifie si l'utilisateur existe
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: "Utilisateur non trouvé" });
//       }

//       // Crée une nouvelle instance de CarAd
//       const newCarAd = new CarAd({
//         titre,
//         description,
//         prix,
//         modele,
//         annee,
//         marque,
//         date,
//         photo: req.file.filename, // Utilisez le nom du fichier téléchargé
//         sponsorship,
//         utilisateur: userId // Associe l'annonce à l'utilisateur
//       });

//       // Enregistre la nouvelle annonce dans la base de données
//       const ad = await newCarAd.save();

//       console.log("Annonce créée avec succès :", ad);
//       res.status(201).json(ad); // Renvoie la nouvelle annonce créée en tant que réponse
//     });
//   } catch (error) {
//     console.error("Erreur lors de la création de l'annonce :", error);
//     res.status(500).json({ error: "Erreur lors de la création de l'annonce " + error }); // Renvoie une erreur en cas d'échec
//   }
// };

const createCarAd = (req, res) => {
  console.log("_1_");
  // The file upload middleware should be used separately
  // This middleware handles the file upload
  upload.single("photo")(req, res, async (err) => {
    console.log("_2_");
    if (err) {
      console.log("_3_");
      // Check for specific multer errors
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File size too large." });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ error: "Too many files uploaded." });
      }
      // Handle other multer errors
      return res.status(500).json({ error: "_Error uploading file: " + err.message });
    }
    // Now you can proceed with your logic after the file has been uploaded
    // Make sure to check if req.file exists before accessing it
    if (!req.file) {
      return res.status(400).json({ error: "No photo uploaded." });
    }

    try {
      const {
        titre,
        description,
        prix,
        modele,
        annee,
        marque,
        date,
        sponsorship,
        userId,
      } = req.body;
      if (
        !titre ||
        !description ||
        !prix ||
        !modele ||
        !annee ||
        !marque ||
        !sponsorship ||
        !date ||
        !userId
      ) {
        return res.status(400).json({ error: "All fields are required." });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const newCarAd = new CarAd({
        titre,
        description,
        prix,
        modele,
        annee,
        marque,
        date,
        photo: req.file.filename,
        sponsorship,
        utilisateur: userId,
      });

      const ad = await newCarAd.save();
      console.log("Ad created successfully:", ad);
      res.status(201).json(ad);
    } catch (error) {
      console.error("Error creating ad:", error);
      res.status(500).json({ error: "Error creating ad: " + error });
    }
  });
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
    const { marque, modele, anneeFrom, anneeTo, prixFrom, prixTo, adresse } = req.query;
    let query = {};

    // Filtrer par marque
    if (marque) {
      query.marque = marque;
    }

    // Filtrer par modèle
    if (modele) {
      query.modele = modele;
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

    // Filtrer par adresse
    if (adresse) {
      query.adresse = adresse;
    }

    // Recherche des annonces de voiture en fonction des critères spécifiés
    const ads = await CarAd.find(query);
    res.status(200).json(ads); // Renvoie les annonces correspondantes
  } catch (error) {
    console.error("Erreur lors de la recherche des annonces de voiture :", error);
    res.status(500).json({
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
