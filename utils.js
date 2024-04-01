const jwt = require("jsonwebtoken");

// Fonction pour générer un token d'authentification
exports.generateLogToken = function (user) {
  return jwt.sign(
    {
      _id: user._id,
      Nom: user.Nom,
      Prenom: user.Prenom,
      Email: user.Email,
    },
    process.env.JWT_PASS || `****`,
    {
      expiresIn: "10d",
    }
  );
};

// Fonction pour vérifier et décoder le token d'authentification
exports.verifyToken = function (token) {
  try {
    // Vérifier le token et le décoder
    const decodedToken = jwt.verify(token, process.env.JWT_PASS || `****`);
    return decodedToken;
  } catch (error) {
    // Si une erreur se produit, renvoyer une erreur
    throw new Error("Token invalide");
  }
};
