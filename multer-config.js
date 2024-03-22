const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Définir les options de stockage
const storage = multer.diskStorage({
  // Définir le dossier de destination pour les fichiers téléchargés
  destination: function (req, file, cb) {
    const uploadDir = './public/uploads/';
    // Vérifier si le dossier de destination existe, sinon le créer
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  // Définir le nom du fichier téléchargé
  filename: function (req, file, cb) {
    // Utilisez une fonction pour générer un nom de fichier unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension);
  },
});

// Limiter les types de fichiers acceptés
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png","image/jpg"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accepter le fichier
  } else {
    cb(new Error("Format de fichier non supporté. Veuillez télécharger une image au format JPEG ou PNG."));
  }
};

// Créer l'instance de multer avec les options de stockage et de filtrage
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // Limite la taille du fichier à 5 Mo
  }
});

module.exports = upload;
