const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");

// Function to handle admin login
let adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminUser = await User.findOne({ Email: email });

    if (!adminUser) {
      return res.status(404).json({ message: "Admin user not found." });
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.Password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    //* Generate JWT token
    const token = jwt.sign(
      { userId: adminUser._id, email: adminUser.Email, role: adminUser.Role },
      process.env.JWT_PASS,
      { expiresIn: "30s" }
    );

    //* Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: adminUser._id, email: adminUser.Email },
      process.env.JWT_REF_PASS,
      { expiresIn: "1d" }
    );

    adminUser.refreshToken = refreshToken;
    await adminUser.save();

    const { Password, ...userDetails } = adminUser.toObject();

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

// Function to update admin's credentials
let updateAdminCredentials = async (req, res) => {
  const { id } = req.params; // Extract the ID from request parameters
  const { oldPassword, newPassword } = req.body;

  try {
    // Find the admin user by ID
    const adminUser = await User.findById(id);

    if (!adminUser) {
      // Return the received data along with the message if admin user not found
      const requestData = { id, newPassword };
      return res
        .status(404)
        .json({ message: "Admin user not found.", requestData });
    }

    // Check if old password is provided
    if (!oldPassword) {
      return res.status(400).json({ message: "Old password is required." });
    }

    // Compare old password with the password stored in the database
    const isOldPasswordValid = await bcrypt.compare(
      oldPassword,
      adminUser.Password
    );
    if (!isOldPasswordValid) {
      return res.status(401).json({ message: "Invalid old password." });
    }

    // Hash the new password if provided
    let hashedPassword;
    if (newPassword) {
      hashedPassword = await bcrypt.hash(newPassword, 10);
    }

    // Update the admin user's password if new password provided
    if (hashedPassword) {
      adminUser.Password = hashedPassword;
      await adminUser.save();
    }

    res
      .status(200)
      .json({ message: "Admin credentials updated successfully." });
  } catch (error) {
    console.error("C: Error updating admin credentials:", error);
    res
      .status(500)
      .json({ error: "Error updating admin credentials: " + error });
  }
};

// module.exports = {
//   adminLogin,
//   updateAdminCredentials,
// };
