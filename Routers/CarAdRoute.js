const express = require("express");
const router = express.Router();
const CarAd = require("../Models/carAd");
const User = require("../Models/User");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const CarAdCache = require("../Models/carAdCache");
const Transaction = require("../Models/transaction");
// const upload = require("../multer-config"); // Importer multer-config

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

// Multer configuration for handling file uploads
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, '../public/uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// const createCarAd = async (req, res) => {
//   console.log("_1_");
//   // The file upload middleware should be used separately
//   // This middleware handles the file upload
//   // upload.single("photo")(req, res, async (err) => {
//     // console.log("_2_");
//     // if (err) {
//     //   console.log("_3_");
//     //   // Check for specific multer errors
//     //   if (err.code === "LIMIT_FILE_SIZE") {
//     //     return res.status(400).json({ error: "File size too large." });
//     //   }
//     //   if (err.code === "LIMIT_UNEXPECTED_FILE") {
//     //     return res.status(400).json({ error: "Too many files uploaded." });
//     //   }
//     //   // Handle other multer errors
//     //   return res.status(500).json({ error: "_Error uploading file: " + err.message });
//     // }
//     // Now you can proceed with your logic after the file has been uploaded
//     // Make sure to check if req.file exists before accessing it
//     if (!req.file) {
//       return res.status(400).json({ error: "No photo uploaded." });
//     }

//     try {
//       const {
//         titre,
//         description,
//         prix,
//         modele,
//         annee,
//         marque,
//         date,
//         sponsorship,
//         userId,
//       } = req.body;
//       // if (
//       //   !titre ||
//       //   !description ||
//       //   !prix ||
//       //   !modele ||
//       //   !annee ||
//       //   !marque ||
//       //   !sponsorship ||
//       //   !date ||
//       //   !userId
//       // ) {
//       //   return res.status(400).json({ error: "All fields are required." });
//       // }

//       // const user = await User.findById(userId);
//       // if (!user) {
//       //   return res.status(404).json({ error: "User not found" });
//       // }

//       const newCarAd = new CarAd({
//         titre,
//         description,
//         prix,
//         modele,
//         annee,
//         marque,
//         date,
//         photo: req.file.filename,
//         sponsorship,
//         utilisateur: userId,
//       });

//       const ad = await newCarAd.save();
//       console.log("Ad created successfully:", ad);
//       res.status(201).json(ad);
//     } catch (error) {
//       console.error("Error creating ad:", error);
//       res.status(500).json({ error: "Error creating ad: " + error });
//     }
//   // });
// };

//récupérer toutes les annonces de voiture

const createCarAd = async (req, res) => {
  try {
    // Extracting fields from the request body
    const {
      titre,
      description,
      prix,
      marque,
      modele,
      annee,
      location,
      kilometrage,
      vitesse,
      sponsorship,
      utilisateur,
    } = req.body;
    console.log(req.body);
    // Check if files are provided
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("Please provide at least one photo");
    }

    // Extract filenames from uploaded files
    const filenames = req.files.map((file) => file.filename);

    // Create a new car ad instance
    const carAdData = new CarAd({
      titre,
      description,
      prix,
      modele,
      annee,
      marque,
      kilometrage,
      vitesse,
      photos: filenames,
      location,
      utilisateur,
    });

    if (sponsorship && sponsorship.length > 0) {
      carAdData.sponsorship = sponsorship;
    }

    const newCarAd = new CarAd(carAdData);

    // Save the new car ad to the database
    const ad = await newCarAd.save();

    if (sponsorship) {
      const transaction = await Transaction.findById(sponsorship);

      if (transaction) {
        const durationInMilliseconds =
          transaction.duration * 24 * 60 * 60 * 1000;

        const expirationDate = new Date(Date.now() + durationInMilliseconds);

        await Transaction.findByIdAndUpdate(
          sponsorship,
          { sponsorshipStatus: "active", expirationDate: expirationDate },
          { new: true }
        );
      }
    }

    console.log("Ad created successfully:", ad);
    await CarAdCache.findOneAndDelete({
      utilisateur: utilisateur,
    });
    // Send a success response
    res.status(201).json(ad);
  } catch (error) {
    console.error("Error creating car ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllCarAds = async (req, res) => {
  const sortField = req.query.sortField || "date";
  const sortOrder = parseInt(req.query.sortOrder) || -1;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;

  try {
    const ads = await CarAd.find()
      .populate("sponsorship")
      .sort({ [sortField]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalAds = await CarAd.countDocuments();

    const sponsoredAds = ads.filter(
      (ad) =>
        ad.sponsorship &&
        ad.sponsorship.sponsorshipStatus === "active" &&
        ad.sponsorship.features.includes(
          "Mis en avant dans les résultats de recherche"
        )
    );
    const nonSponsoredAds = ads.filter(
      (ad) =>
        !ad.sponsorship ||
        ad.sponsorship.sponsorshipStatus !== "active" ||
        !ad.sponsorship.features.includes(
          "Mis en avant dans les résultats de recherche"
        )
    );
    const sortedAds = [...sponsoredAds, ...nonSponsoredAds];

    res.status(200).json({
      totalAds,
      totalPages: Math.ceil(totalAds / limit),
      currentPage: page,
      sortedAds,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des annonces :", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des annonces " + error });
  }
};
//  modifier une annonce de voiture
const updateCarAd = async (req, res) => {
  try {
    const {
      titre,
      description,
      prix,
      marque,
      modele,
      annee,
      location,
      photos,
    } = req.body;
    const { id } = req.params;
    console.log(req.body);
    console.log(photos);
    // Check if a photo has been uploaded
    // const photo = req.file ? req.file.filename : null;

    // Find the existing car ad by ID and update its details
    let updatedDetails = {
      titre,
      description,
      prix,
      marque,
      modele,
      annee,
      location,
      photos,
    };

    // Update the photo only if a new ones are provided
    if (req.files && req.files.length > 0) {
      console.log("_______________1_______________");
      updatedDetails.photos = req.files.map((file) => file.filename);
    } else {
      console.log("_______________2_______________");
      updatedDetails.photos = photos;
    }
    console.log(updatedDetails);
    // Find and update the car ad in the database
    const ad = await CarAd.findByIdAndUpdate(id, updatedDetails, { new: true });

    // Check if the car ad exists
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
    res.status(200).json({ message: "Annonce supprimée avec succès :" });
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

    const ad = await CarAd.findById(id)
      .populate("utilisateur", ["Nom", "Prenom", "Numero", "photo"])
      .populate("sponsorship");
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

// récupérer toutes les annonces de voiture par l'ID de l'utilisateur
let getCarAdByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Rechercher toutes les annonces de voiture de l'utilisateur spécifié
    const ads = await CarAd.find({ utilisateur: userId }).populate(
      "sponsorship"
    );
    res.status(200).json(ads); // Renvoie les annonces correspondantes
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des annonces par utilisateur :",
      error
    );
    res.status(500).json({
      error:
        "Erreur lors de la récupération des annonces par utilisateur " + error,
    });
  }
};

// rechercher des annonces de voiture en fonction de certains critères
// let searchCarAds = async (req, res) => {
//   try {
//     const { marque, modele, anneeFrom, anneeTo, prixFrom, prixTo, adresse } =
//       req.query;
//     let query = {};

//     // Filtrer par marque
//     if (marque) {
//       query.marque = marque;
//     }

//     // Filtrer par modèle
//     if (modele) {
//       query.modele = modele;
//     }

//     // Filtrer par année (intervalle)
//     if (anneeFrom && anneeTo) {
//       query.annee = { $gte: anneeFrom, $lte: anneeTo };
//     } else if (anneeFrom) {
//       query.annee = { $gte: anneeFrom };
//     } else if (anneeTo) {
//       query.annee = { $lte: anneeTo };
//     }

//     // Filtrer par prix (intervalle)
//     if (prixFrom && prixTo) {
//       query.prix = { $gte: prixFrom, $lte: prixTo };
//     } else if (prixFrom) {
//       query.prix = { $gte: prixFrom };
//     } else if (prixTo) {
//       query.prix = { $lte: prixTo };
//     }

//     // Filtrer par adresse
//     if (adresse) {
//       query.adresse = adresse;
//     }
//     console.log(query);
//     // Recherche des annonces de voiture en fonction des critères spécifiés
//     const ads = await CarAd.find(query).populate("sponsorship");
//     res.status(200).json(ads); // Renvoie les annonces correspondantes
//   } catch (error) {
//     console.error(
//       "Erreur lors de la recherche des annonces de voiture :",
//       error
//     );
//     res.status(500).json({
//       error: "Erreur lors de la recherche des annonces de voiture " + error,
//     });
//   }
// };

const searchCarAds = async (req, res) => {
  try {
    const {
      marque,
      modele,
      anneeFrom,
      anneeTo,
      prixFrom,
      prixTo,
      adresse,
      date,
      page = 1,
      limit = 10,
    } = req.query;
    let query = {};

    // Filtrer par marque
    if (marque) {
      query.marque = new RegExp(marque, "i");
    }

    // Filtrer par modèle (insensible à la casse)
    if (modele) {
      query.modele = new RegExp(modele, "i");
    }

    // Filtrer par date de publication 
    if (date) {
      const parsedDate = new Date(date);
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));
      
      query.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
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
      query.location = new RegExp(adresse, "i");
    }

    console.log(query);

    // Calculate the skip value
    const skip = (page - 1) * limit;

    // Recherche des annonces de voiture en fonction des critères spécifiés
    const ads = await CarAd.find(query)
      .populate("sponsorship")
      .sort({ ["date"]: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Séparation et tri des annonces par statut de parrainage
    const sponsoredAds = ads.filter(
      (ad) =>
        ad.sponsorship &&
        ad.sponsorship.sponsorshipStatus === "active" &&
        ad.sponsorship.features.includes(
          "Mis en avant dans les résultats de recherche"
        )
    );
    const nonSponsoredAds = ads.filter(
      (ad) =>
        !ad.sponsorship ||
        ad.sponsorship.sponsorshipStatus !== "active" ||
        !ad.sponsorship.features.includes(
          "Mis en avant dans les résultats de recherche"
        )
    );

    // Combinaison des listes avec les annonces sponsorisées en premier
    const sortedAds = [...sponsoredAds, ...nonSponsoredAds];

    const totalPages = Math.ceil((await CarAd.countDocuments(query)) / limit);

    res.status(200).json({
      total: totalPages,
      data: sortedAds,
    }); // Renvoie les annonces triées
  } catch (error) {
    console.error(
      "Erreur lors de la recherche des annonces de voiture :",
      error
    );
    res.status(500).json({
      error: "Erreur lors de la recherche des annonces de voiture " + error,
    });
  }
};

// Route to search and return CarAds by the specified feature in their sponsorship
const getCarAdsByFeature = async (req, res) => {
  try {
    // Extract the feature from the query parameters
    const { feature } = req.query;

    // Validate the feature
    if (!feature) {
      return res.status(400).json({ error: "Feature must be provided" });
    }
    console.log(feature);
    // Find CarAds where the sponsorship features array contains the specified feature
    const CarAds = await CarAd.find().populate("sponsorship");
    const matchingCarAds = CarAds.filter((carAd) => {
      return (
        carAd.sponsorship &&
        carAd.sponsorship.sponsorshipStatus === "active" &&
        carAd.sponsorship.features.includes(feature) &&
        carAd.sponsorship.expirationDate > Date.now()
      );
    });

    res.status(200).json(matchingCarAds);
  } catch (error) {
    console.error("Error searching CarAds by feature:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const carAdSponsorshipStat = async (req, res) => {
  try {
    const totalCarAds = await CarAd.countDocuments();

    const activeSponsoredCarAds = await CarAd.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "sponsorship",
          foreignField: "_id",
          as: "sponsorshipDetails",
        },
      },
      {
        $unwind: {
          path: "$sponsorshipDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "sponsorshipDetails.sponsorshipStatus": "active",
        },
      },
      {
        $count: "activeSponsored",
      },
    ]);

    const activeSponsoredCount =
      activeSponsoredCarAds.length > 0
        ? activeSponsoredCarAds[0].activeSponsored
        : 0;
    const unsponsoredCount = totalCarAds - activeSponsoredCount;

    const activeSponsoredPercentage = (
      (activeSponsoredCount / totalCarAds) *
      100
    ).toFixed(2);
    const unsponsoredPercentage = (
      (unsponsoredCount / totalCarAds) *
      100
    ).toFixed(2);

    res.status(200).json({
      activeSponsoredPercentage,
      unsponsoredPercentage,
      activeSponsoredCount,
      unsponsoredCount,
    });
  } catch (error) {
    console.error("Error fetching car sponsorship stats:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// const delete_unused_photos = async (req, res) => {
//   try {
//     // Find all photo paths from CarAds
//     const carAds = await CarAd.find({}, "photo");
//     const usedPhotoPaths = carAds.map((ad) => ad.photo);

//     // Assuming photos are stored in the 'public/uploads' directory
//     const uploadDir = path.join(__dirname, "..", "public", "uploads");

//     // Get all files in the uploads directory
//     const allFiles = fs.readdirSync(uploadDir);

//     // Filter out files that are not used as photos in CarAds
//     const unusedPhotos = allFiles.filter(
//       (file) => !usedPhotoPaths.includes(file)
//     );

//     // Delete unused photos
//     unusedPhotos.forEach((file) => {
//       const filePath = path.join(uploadDir, file);
//       fs.unlinkSync(filePath);
//       console.log(`Deleted photo: ${filePath}`);
//     });

//     res.json({
//       message: "Unused photos deleted successfully",
//       deletedPhotos: unusedPhotos,
//     });
//   } catch (error) {
//     console.error("Error deleting unused photos:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports = {
  createCarAd,
  getAllCarAds,
  updateCarAd,
  deleteCarAd,
  getCarAdById,
  searchCarAds,
  getCarAdByUserId,
  getCarAdsByFeature,
  carAdSponsorshipStat,
  // delete_unused_photos,
};
