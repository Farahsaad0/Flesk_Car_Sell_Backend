const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const sendEmail = require("../utils/sendEmail");
const ExpertProfile = require("../Models/expert");

const register = async (req, res) => {
  try {
    const {
      Email,
      Nom,
      Prenom,
      Password,
      ConfirmPassword,
      Role,
      Numéro,
      Adresse,
      Spécialité,
      prix,
      experience,
    } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà existant!" });
    }

    // Validate password
    if (!Password || Password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    // Check if ConfirmPassword matches Password
    if (Password !== ConfirmPassword) {
      return res
        .status(400)
        .json({ message: "Les mots de passe ne correspondent pas." });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(Password)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.",
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);

    const hashedPassword = await bcrypt.hash(Password, 10);

    const newUser = new User({
      Nom,
      Prenom,
      Email,
      Password: hashedPassword,
      Role,
      Numéro,
      Adresse,
      Verified_code: verificationCode,
      Statut: Role.toLowerCase() === "expert" ? "En attente" : "Approuvé",
    });

    await newUser.save();

    const subject = "Code de vérification pour votre inscription";

    if (Role.toLowerCase() === "expert") {
      const newExpert = new ExpertProfile({
        spécialité: Spécialité,
        prix,
        experience,
      });
      await newExpert.save();
      newUser.ExpertId = newExpert._id;
      await newUser.save();
    }
    const variables = {
      type: "verification Code",
      code_de_verification: verificationCode,
      Date: new Date(Date.now()).toLocaleDateString(),
    };
    console.log(variables.type + " << from authController.");
    await emailSender(newUser.Email, subject, variables);

    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur." });
  }
};

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
      { expiresIn: "5m" }
    );

    //* Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: foundUser._id, email: foundUser.Email, role: foundUser.Role },
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
    res
      .status(500)
      .json({ error: "Failed to log in. Please try again later." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ Email: email.toLowerCase() });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Generate reset password token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.RESET_PASS_TOKEN,
      { expiresIn: "1h" }
    );

    // Send reset password link to the user's email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const subject = "Password Reset Link";
    const message = `Hello ${user.Prenom},\n\nPlease click on the following link to reset your password:\n${resetLink}\n\nIf you didn't request this, please ignore this email.`;

    await sendEmail(user.Email, subject, message);

    res
      .status(200)
      .json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error("Error resetting password:", error);
    res
      .status(500)
      .json({ error: "Failed to reset password. Please try again later." });
  }
};

const emailSender = async (email, subject, variables) => {
  //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
  // const subject = "Code de vérification pour votre inscription";
  // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

  try {
    await sendEmail(email, subject, variables);
    console.log("E-mail de notification envoyé avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail de notification :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
  }
};

module.exports = {
  login,
  register,
  resetPassword,
};
