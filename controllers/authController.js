const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

let login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ Email: email.toLowerCase() }); // Ensure case-insensitive search

    if (!foundUser) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    //* Generate JWT token
    const token = jwt.sign(
      { userId: foundUser._id, email: foundUser.Email, role: foundUser.Role },
      process.env.JWT_PASS,
      { expiresIn: "1h" } // Changed to 1 hour
    );

    //* Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: foundUser._id, email: foundUser.Email },
      process.env.JWT_REF_PASS,
      { expiresIn: "1d" }
    );

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    const { Password, ...userDetails } = foundUser.toObject();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token, User: userDetails });
  } catch (error) {
    console.error("Error logging in: ", error);
    res.status(500).json({ error: "Failed to log in. Please try again later." });
  }
};

module.exports = {
  login,
};
