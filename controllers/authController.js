const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");


let Login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin user by email
    const User = await User.findOne({ Email: email });

    if (!User) {
      return res.status(404).json({ message: "user not found." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, User.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    //* Generate JWT token
    const token = jwt.sign(
      { userId: User._id, email: User.Email, role: User.Role },
      process.env.JWT_PASS,
      { expiresIn: "30s" }
    );

    //* Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: User._id, email: User.Email },
      process.env.JWT_REF_PASS,
      { expiresIn: "1d" }
    );

    User.refreshToken = refreshToken;
    await User.save();

    const { Password, ...userDetails } = User.toObject();

    // Set cookie with refresh token
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ token, User: userDetails });
  } catch (error) {
    console.error("C: Error logging in admin:", error);
    res.status(500).json({ error: "Error logging in admin: " + error });
  }
};