const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const {
  file_multi_upload,
  single_upload,
  multi_upload,
} = require("./multer-config");
const verifyJWT = require("./middleware/verifyJWT");
const socketIo = require("socket.io");
const http = require("http");
const Job = require("./Models/Job");
const rateLimiter = require("express-rate-limit");

// Import controllers
const userController = require("./Routers/UserRouter");
const carAdController = require("./Routers/CarAdRoute");
const expertController = require("./Routers/ExpertRoute");
const adminController = require("./Routers/AdminRoute");
const logoutController = require("./controllers/logoutController");
const refreshTokenController = require("./controllers/refreshTokenController");
const sponsorshipController = require("./controllers/sponsorshipController");
const jobController = require("./controllers/jobController");
const authController = require("./controllers/authController");
const contactController = require("./Routers/ContactRoute");
const paymentController = require("./controllers/paymentController");
const carAdCacheController = require("./controllers/carAdCacheController");
const transactionController = require("./controllers/transactionController");

dotenv.config();

const port = process.env.PORT || 8000;
const app = express();

// console.log(cv);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    // origin: "*",
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://8n7vlqww-3000.euw.devtunnels.ms",
      "http://localhost:8000",
    ],
  })
);
// app.use(cors());
app.use(cookieParser()); 

// Rate limiting middleware
// const loginLimiter = rateLimiter({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 5 login requests per windowMs
//   message: {
//     message:
//       "Trop de tentatives de connexion depuis cette adresse IP. Veuillez réessayer dans 15 minutes.",
//   },
// });

const server = http.createServer(app);
server.listen(8001, () => {
  console.log("live chat server running on port 8001");
});
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "https://8n7vlqww-3000.euw.devtunnels.ms",
      "http://localhost:8000",
    ],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("New client connected");
  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });

  socket.on("sendMessage", async ({ jobId, sender, message, timestamp }) => {
    try {
      const job = await Job.findById(jobId);
      if (job) {
        job.chat.push({ sender, message });
        await job.save();
        io.emit("receiveMessage", { jobId, sender, message, timestamp });
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
});

// Logging middleware function
const logRequest = (req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.file);
  next();
};

// Mount the logging middleware
app.use(logRequest);

//* authentication routes
app.post("/login", authController.login);
app.post("/register", file_multi_upload, authController.register);
app.post("/resetPassword", authController.resetPassword);
app.put("/changePassword/:token", authController.setPassword);
app.post("/verify", authController.verifyRouteHandler);
app.post("/resendVerificationCode", authController.resendVerificationCode);
app.get("/logout", logoutController.handleLogout);
app.get("/refresh", refreshTokenController.handleRefreshToken);

//* file routes:
app.use("/images", express.static("public/uploads/"));
app.use("/documents", express.static("public/uploads/"));

//* user related routes:
app.get("/getUserData/:id", userController.getUserData);
app.put("/updateUserData/:id", single_upload, userController.updateUserData);
app.get("/getAllUsers", verifyJWT, userController.getAllUsers);
app.get("/getUser/:id", userController.getUserById);

//* contact routes:
// app.post("/contact", contactController.contact);

//* car routes:
app.post("/carAds", multi_upload, carAdController.createCarAd);
app.get("/getCarAdByUserId/:userId", carAdController.getCarAdByUserId);
app.get("/carAds", carAdController.getAllCarAds);
// app.delete("/delete_unused_photos", carAdController.delete_unused_photos);
app.put("/carAd/update/:id", multi_upload, carAdController.updateCarAd);
app.delete("/carAds/:id", verifyJWT, carAdController.deleteCarAd);
app.get("/carAds/search", carAdController.searchCarAds);
app.get("/carAds/sponsored", carAdController.getCarAdsByFeature);
app.get("/carAds/details/:id", carAdController.getCarAdById); //importantttttt

//* carAdCache routes:
app.post(
  "/carAdCache",
  verifyJWT,
  single_upload,
  carAdCacheController.createCarAdCache
);
app.get("/carAdCache/:userId", carAdCacheController.getCarAdCache);

//* transaction routes:
app.get(
  "/sponsorships/available/:userId",
  transactionController.getInactivatedSponsorships
);
app.get(
  "/transactions/expert/:id",
  transactionController.getExpertCompletedTransactions
);
app.get(
  "/transactions/:id",
  transactionController.getClientCompletedTransactions
);
app.get("/transactions/", transactionController.getTransactions);

//* Sponsorship routes:
app.post("/sponsorship", verifyJWT, sponsorshipController.createSponsorship);
app.get("/sponsorships", sponsorshipController.getAllSponsorships);
app.get("/sponsorship/:id", sponsorshipController.getOneSponsorship);
app.put("/sponsorship/:id", verifyJWT, sponsorshipController.updateSponsorship);
app.delete(
  "/sponsorship/:id",
  verifyJWT,
  sponsorshipController.deleteSponsorship
);

//* Experts routes:
app.get("/experts", expertController.getApprovedExperts);
app.get("/getPendingExperts", verifyJWT, userController.getPendingExperts);
app.put("/approuverExpert/:id", verifyJWT, expertController.approuverExpert);
app.put("/rejeterExpert/:id", verifyJWT, expertController.rejeterExpert);
app.post(
  "/demandeExpert",
  file_multi_upload,
  expertController.demandeExpertRole
);
app.get("/nbExpertisme/:id", expertController.getJobsCountByExpert);

//* Job routes:
app.post("/createJob", jobController.createJob);
app.get("/job/:id", jobController.getJobById);
app.post("/job/:id/upload", file_multi_upload, jobController.uploadDocuments);
app.delete("/job/:id/files/:fileName", jobController.deleteDocument);
app.get("/job/files", jobController.fetchAllDocuments);
// app.post("/job/:id/chat", jobController.sendMessage); // depricated
app.get("/jobs/expert/:expertId", jobController.getJobsByExpertId);
app.get("/jobs/client/:clientId", jobController.getJobsByClientId);
app.put("/jobs/accept/:jobId", jobController.acceptJob);
app.put("/jobs/reject/:jobId", jobController.rejectJob);
app.put("/jobs/cancel/:jobId", jobController.cancelJob);
app.get(
  "/jobs/car/:carAdId/assigned-experts",
  verifyJWT,
  jobController.getAssignedExpertIdsForCarAndClient
);

//* contact routes ;
app.post("/contacts",contactController.contact);
app.get("/contacts",contactController.getContacts);

//* admin routes:
// app.post("/adminLogin", adminController.adminLogin);
app.put("/updateAdmin/:id", verifyJWT, adminController.updateAdminCredentials);
app.put("/users/:id/block", verifyJWT, userController.blockUser);
app.put("/users/:id/unblock", verifyJWT, userController.unblockUser);

// app.put("/:id", expertController.updateExpert);
// app.delete("/:id", expertController.deleteExpert);

//* payment routes
app.post("/init-payment", paymentController.payment);
app.get("/konnect/webhook", paymentController.payment_update);

//* vvv #####################_server related functions_##################### vvv

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });
