const jwt = require("jsonwebtoken");

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
