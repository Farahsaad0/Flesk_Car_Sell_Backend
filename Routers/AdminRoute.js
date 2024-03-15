const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// Function to handle admin login
const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the admin user by email
    const adminUser = await User.findOne({ Email : email});

    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, adminUser.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, email: adminUser.Email, role: adminUser.Role },
      process.env.JWT_PASS,
      { expiresIn: "1h" }
    );

    // Exclude password from adminUser object
    const { Password, ...userDetails } = adminUser.toObject();

    // Return token and user details without password
    res.status(200).json({ token, adminUser: userDetails });
  } catch (error) {
    console.error("C: Error logging in admin:", error);
    res.status(500).json({ error: "Error logging in admin: " + error });
  }
};

module.exports = {
  adminLogin,
};
