const User = require("../Models/User");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.refreshToken) return res.sendStatus(401);
  const refreshToken = cookies.refreshToken;

  const foundUser = await User.findOne({ refreshToken });
  if (!foundUser) return res.sendStatus(403); //Forbidden
  // evaluate jwt
  jwt.verify(refreshToken, process.env.JWT_REF_PASS, (err, decoded) => {
    if (err || foundUser.Email !== decoded.email) return res.sendStatus(403);
    // const Role = Object.values(foundUser.Role);
    const Role = foundUser.Role;
    const accessToken = jwt.sign(
      {
        email: decoded.email,
        role: Role,
      },
      process.env.JWT_PASS,
      { expiresIn: "30s" }
    );
    res.json({ Role, accessToken });
  });
};

module.exports = { handleRefreshToken };
