const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const { single_upload, multi_upload } = require("./multer-config");
const verifyJWT = require("./middleware/verifyJWT");

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

const port = process.env.PORT;
const app = express();

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
    // origin: function (origin, callback) {
    //   // Allow requests with no origin (like mobile apps or curl requests)
    //   if (!origin) return callback(null, true);

    //   // Check if the request origin is allowed
    //   const allowedOrigins = ["http://*:*"];
    //   if (allowedOrigins.indexOf(origin) === -1) {
    //     const msg =
    //       "__-__-_The CORS policy for this site does not allow access from the specified origin.";
    //     return callback(new Error(msg), false);
    //   }

    //   return callback(null, true);
    // },
  })
);
// app.use(cors());
app.use(cookieParser());

// Logging middleware function
const logRequest = (req, res, next) => {
  console.log("Request URL:", req.url);
  console.log("Request Method:", req.method);
  console.log("Request Headers:", req.headers);
  console.log("Request Body:", req.file); // This will log the request body, if it's parsed by body-parser or similar middleware
  next(); // Call next() to pass control to the next middleware or route handler
};

// Mount the logging middleware
app.use(logRequest);

//* authentication routes
app.post("/login", authController.login);
app.post("/register", authController.register);
app.post("/resetPassword", authController.resetPassword);
app.put("/changePassword/:token", authController.setPassword);
app.post("/verify", userController.verifyRouteHandler);
app.get("/logout", logoutController.handleLogout);
app.get("/refresh", refreshTokenController.handleRefreshToken);

app.get("/getUserData/:id", userController.getUserData);
//app.put("/updateUserData/:id", verifyJWT, upload.single("photo"), userController.updateUserData);
app.put("/updateUserData/:id", single_upload, userController.updateUserData);
//* route contact
app.post("/contact", contactController.contact);

app.get("/getAllUsers", verifyJWT, userController.getAllUsers);
app.get("/getUser/:id", userController.getUserById);

//* car routes
//app.post("/carAds", carAdController.createCarAd);
app.use("/images", express.static("public/uploads/"));
// app.post("/carAds", upload.single("photo"), carAdController.createCarAd);
app.post("/carAds", multi_upload, carAdController.createCarAd);

app.get("/getCarAdByUserId/:userId", carAdController.getCarAdByUserId);

app.get("/carAds", carAdController.getAllCarAds);
// app.delete("/delete_unused_photos", carAdController.delete_unused_photos);
app.put("/:id", verifyJWT, single_upload, carAdController.updateCarAd);
app.delete("/carAds/:id", verifyJWT, carAdController.deleteCarAd);
app.get("/carAds/search", carAdController.searchCarAds);
app.get("/carAds/sponsored", carAdController.searchCarAdsByFeature);
app.get("/carAds/details/:id", carAdController.getCarAdById); //importantttttt

app.put("/:id/specialite", expertController.updateSpecialite);
// app.get("/experts", expertController.getAllExperts);
// app.put("/:id/bloquer", expertController.bloquerExpert);

//* carAdCache routes
app.post(
  "/carAdCache",
  verifyJWT,
  single_upload,
  carAdCacheController.createCarAdCache
);
app.get("/carAdCache/:userId", carAdCacheController.getCarAdCache);

app.get(
  "/sponsorships/available/:userId",
  transactionController.getInactivatedSponsorships
);

//* Sponsorship routes
app.post("/sponsorship", verifyJWT, sponsorshipController.createSponsorship);
app.get("/sponsorships", sponsorshipController.getAllSponsorships);
app.get("/sponsorship/:id", sponsorshipController.getOneSponsorship);
app.put("/sponsorship/:id", verifyJWT, sponsorshipController.updateSponsorship);
app.delete(
  "/sponsorship/:id",
  verifyJWT,
  sponsorshipController.deleteSponsorship
);

//* Experts routes
app.get("/experts", expertController.getApprovedExperts);
app.get("/getPendingExperts", verifyJWT, userController.getPendingExperts);
app.put("/approuverExpert/:id", verifyJWT, expertController.approuverExpert);
app.put("/rejeterExpert/:id", verifyJWT, expertController.rejeterExpert);
app.post("/demandeExpert", expertController.requestExpertRole);
app.get("/nbExpertisme/:id", expertController.getJobsCountByExpert);
//* Job routes
app.post("/createJob", jobController.createJob);
app.get("/job/:id", jobController.getJobById);
app.post("/job/:id/chat", jobController.sendMessage);
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

//* admin routes
app.post("/adminLogin", adminController.adminLogin);
app.put("/updateAdmin/:id", verifyJWT, adminController.updateAdminCredentials);
app.put("/users/:id/block", verifyJWT, userController.blockUser);
app.put("/users/:id/unblock", verifyJWT, userController.unblockUser);

// app.put("/:id", expertController.updateExpert);
// app.delete("/:id", expertController.deleteExpert);

//* payment routes
app.post("/init-payment", paymentController.payment);
app.get("/konnect/webhook", paymentController.payment_update);

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
