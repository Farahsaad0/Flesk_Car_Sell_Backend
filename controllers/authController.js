const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const emailSender = require("../utils/sendEmail");
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
      Numero,
      Adresse,
      Specialite,
      prix,
      experience,
    } = req.body;      // c le body de http request body qui arrive de front end 

    // Validate email address
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; //vérifier la forme de l'email
    if (!emailRegex.test(Email)) {
      return res.status(400).json({ message: "Invalid email addres" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ Email });
    if (existingUser) {
      return res.status(400).json({ message: "Utilisateur déjà existant!" });
    } //verifier si l'utilisateur existe ou non avec cette email 

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

    const hashedPassword = await bcrypt.hash(Password, 10); // cryptage pour la sécurité 

    const newUser = new User({
      Nom,
      Prenom,
      Email,
      Password: hashedPassword,
      Role: Role || "Utilisateur",
      Numero,
      Adresse,
      Verified_code: verificationCode,
      Statut: Role.toLowerCase() === "expert" ? "En attente" : "Approuvé",
    });

    const subject = "Code de vérification pour votre inscription"; // sujet de l'email

    if (Role.toLowerCase() === "expert") {
      if (!req.files) {
        res
          .status(400)
          .json({ message: "la document de confiance est obligatoire" });
      }

      const documentDeConfiance = req.files.map((file) => file.filename); //telechargement cv 
      const newExpert = new ExpertProfile({
        specialite: Specialite,
        prix,
        experience,
        documentDeConfiance,
      });

      await newExpert.save();
      newUser.ExpertId = newExpert._id; // bsh norbtou expert profile b document mta utilisateur hedheka aleh nhootou id 
    }

    await newUser.save();
    const variables = {
      type: "verification Code",
      code_de_verification: verificationCode,
      Date: new Date(Date.now()).toLocaleDateString(),
    };
    console.log(variables.type + " << from authController.");
    await emailSender(newUser.Email, subject, variables); // variable bsh yetbaa3thou el send email 

    res
      .status(201)
      .json({ message: "User registered successfully.", user: newUser });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la création de l'utilisateur." });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const foundUser = await User.findOne({ Email: email.toLowerCase() }); // Ensure case-insensitive search

    if (!foundUser) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.Password); // va crypter le mot passe bsh y9arenha elli fl base de données 

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ message: "Nom d'utilisateur ou mot de passe non valide." });
    }
    if (foundUser.Statut === "Bloqué") {
      console.log(`Blocked login attempt for user: ${foundUser.Nom}`);
      return res
        .status(403)
        .json({ message: "Votre compte est bloqué par l'administrateur" });
    }
    if (foundUser.Statut === "En attente" && foundUser.ExpertId) {
      console.log(`Blocked login attempt for user: ${foundUser.Nom}`);
      return res
        .status(403)
        .json({ message: "Votre compte est en attend  de l'acceptation de l'administrateur" }); 
    }

    //* Generate JWT token
    const token = jwt.sign( 
      { userId: foundUser._id, email: foundUser.Email, role: foundUser.Role },
      process.env.JWT_PASS,
      { expiresIn: "10m" }
    );

    //* Generate Refresh Token
    const refreshToken = jwt.sign(
      { userId: foundUser._id, email: foundUser.Email, role: foundUser.Role },
      process.env.JWT_REF_PASS,
      { expiresIn: "1d" }
    ); 

   
    if (foundUser.Verified === false) {
      const { Password, ...unverifiedUserDetails } = foundUser.toObject();
      res.status(200).json({ User: unverifiedUserDetails });
    } else {
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
    }
  } catch (error) {
    console.error("Error logging in: ", error);
    res.status(500).json({
      error: "Impossible de se connecter. Veuillez réessayer plus tard.",
    });
  }
};

const resendVerificationCode = async (req, res) => {
  const { email } = req.body;
  const subject = "Code de vérification pour votre inscription";
  try {
    const user = await User.findOne({ Email: email });

    if (!user) {
      return res.status(400).json({ message: "ce compte n'existe pas." });
    }
    if (user.Verified !== false) {
      return res
        .status(400)
        .json({ message: "cette email est déjà vérifier." });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    user.Verified_code = verificationCode;
    await user.save();

    const variables = {
      type: "verification Code",
      code_de_verification: verificationCode,
      Date: new Date(Date.now()).toLocaleDateString(),
    };
    await emailSender(user.Email, subject, variables);
    res
      .status(200)
      .json({ message: "Code de verification envoyer avec succes." });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur :", error);
    res
      .status(500)
      .json({
        message: "Erreur lors de l'envoi de nouveau code de verification'.",
      });
  }
};

// Route pour valider le code de vérification et finaliser l'inscription
const verifyRouteHandler = async (req, res) => {
  const { email, verificationCode } = req.body;
  try {
    // Recherche de l'utilisateur dans la base de données
    let user = await User.findOne({ Email: email });

    // Vérification du code de vérification
    if (!user || user.Verified_code !== parseInt(verificationCode)) {
      return res
        .status(400)
        .json({ message: "Code de vérification invalide." });
    }

    // Marquer l'utilisateur comme vérifié
    user.Verified = true;

    await user.save();

    // Répondre avec un message de succès
    res.status(200).json({ message: "Inscription finalisée avec succès." });
  } catch (error) {
    console.error(
      "Erreur lors de la vérification du code de vérification :",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la vérification du code de vérification.",
    });
  }
};
// mot passe oublier 
const resetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ Email: email.toLowerCase() });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "Utilisateur introuvable." });
    }

    // Generate reset password token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_RESET_PASS_TOKEN,
      { expiresIn: "1h" }
    );

    // Send reset password link to the user's email
    const resetLink = `${process.env.FRONTEND_URL}/changePassword/${resetToken}`; // reset token feha email utilisateur et date de validation 
    const subject = "Lien de réinitialisation du mot de passe";
    const message = `Hello ${user.Prenom},\n\nPlease click on the following link to reset your password:\n${resetLink}\n\nIf you didn't request this, please ignore this email.`;

    const variables = {
      type: "verification Code",
      code_de_verification: resetLink,
      Date: new Date(Date.now()).toLocaleDateString(),
    };

    await sendEmail(user.Email, subject, variables);

    res.status(200).json({
      message:
        "Lien de réinitialisation du mot de passe envoyé à votre adresse e-mail.",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      error:
        "Impossible de réinitialiser le mot de passe. Veuillez réessayer plus tard.",
    });
  }
};

const setPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Validate password
    if (!password || password.length < 8) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins 8 caractères.",
      });
    }

    // Validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Le mot de passe doit contenir au moins une lettre majuscule, une lettre minuscule et un chiffre.",
      });
    }
    console.log(token);
    console.log(token);
    console.log(token);
    // Decode the token to get the user ID
    const decodedToken = jwt.verify(token, process.env.JWT_RESET_PASS_TOKEN); // ba3d metousel token , il va le décoder pour prendre les informations pour voir quelle est le compte qu'on va changer son mot passe 
    const userId = decodedToken.userId;

    // Find the user by ID
    const user = await User.findById(userId);

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.Password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Mot de passe mis à jour avec succès." });
  } catch (error) {
    console.error("Error setting new password:", error);
    res.status(500).json({
      error:
        "Impossible de définir le nouveau mot de passe. Veuillez réessayer plus tard.",
    });
  }
};

// const emailSender = async (email, subject, variables) => {
//   //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
//   // const subject = "Code de vérification pour votre inscription";
//   // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

//   try {
//     await sendEmail(email, subject, variables);
//     console.log("E-mail de notification envoyé avec succès");
//   } catch (error) {
//     console.error(
//       "Erreur lors de l'envoi de l'e-mail de notification :",
//       error
//     );
//     throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
//   }
// };

module.exports = {
  login,
  register,
  verifyRouteHandler,
  resetPassword,
  setPassword,
  resendVerificationCode,
};
