const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const upload = require("./multer-config");
const verifyJWT = require("./middleware/verifyJWT");

// Import controllers
const userController = require("./Routers/UserRouter");
const carAdController = require("./Routers/CarAdRoute");
const expertController = require("./Routers/ExpertRoute");
const adminController = require("./Routers/AdminRoute");
const logoutController = require("./controllers/logoutController");
const refreshTokenController = require("./controllers/refreshTokenController");
const subscriptionController = require("./controllers/subscriptionController");
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
app.post("/register", userController.register);
app.post("/verify", userController.verifyRouteHandler);
app.get("/logout", logoutController.handleLogout);
app.get("/refresh", refreshTokenController.handleRefreshToken);

app.get("/getUserData/:id", userController.getUserData);
//app.put("/updateUserData/:id", verifyJWT, upload.single("photo"), userController.updateUserData);
app.put(
  "/updateUserData/:id",
  upload.single("photo"),
  userController.updateUserData
);
//* route contact
app.post("/contact", contactController.contact);

app.get("/getAllUsers", verifyJWT, userController.getAllUsers);
app.get("/getUser/:id", userController.getUserById);

//* car routes
//app.post("/carAds", carAdController.createCarAd);
app.use("/images", express.static("public/uploads/"));
app.post("/carAds", upload.single("photo"), carAdController.createCarAd);

app.get("/getCarAdByUserId/:userId", carAdController.getCarAdByUserId);

app.get("/carAds", carAdController.getAllCarAds);
// app.delete("/delete_unused_photos", carAdController.delete_unused_photos);
app.put("/:id", verifyJWT, upload.single("photo"), carAdController.updateCarAd);
app.delete("/carAds/:id", verifyJWT, carAdController.deleteCarAd);
app.get("/carAds/:id", carAdController.getCarAdById);
app.get("/carAds/search", carAdController.searchCarAds);
app.put("/:id/specialite", expertController.updateSpecialite);
// app.get("/experts", expertController.getAllExperts);
// app.put("/:id/bloquer", expertController.bloquerExpert);

//* carAdCache routes
app.post(
  "/carAdCache",
  verifyJWT,
  upload.single("photo"),
  carAdCacheController.createCarAdCache
);
app.get("/carAdCache/:userId", carAdCacheController.getCarAdCache);

app.get("/sponsorships/available/:userId", transactionController.getInactivatedSponsorships);

//* Subscription routes
app.post("/subscription", verifyJWT, subscriptionController.createSubscription);
app.get("/subscriptions", subscriptionController.getAllSubscriptions);
app.get("/subscription/:id", subscriptionController.getOneSubscription);
app.put(
  "/subscription/:id",
  verifyJWT,
  subscriptionController.updateSubscription
);
app.delete(
  "/subscription/:id",
  verifyJWT,
  subscriptionController.deleteSubscription
);

//* Experts routes
app.get("/experts", expertController.getApprovedExperts);
app.get("/getPendingExperts", verifyJWT, userController.getPendingExperts);
app.put("/approuverExpert/:id", verifyJWT, expertController.approuverExpert);
app.put("/rejeterExpert/:id", verifyJWT, expertController.rejeterExpert);

//* Job routes
app.post("/createJob", jobController.createJob);
app.get("/jobs/:expertId", jobController.getJobsByExpertId);
app.get("/jobs/:clientId", jobController.getJobsByClientId);
app.put("/jobs/accept/:jobId", jobController.acceptJob);
app.put("/jobs/reject/:jobId", jobController.rejectJob);

//* admin routes
app.post("/adminLogin", adminController.adminLogin);
app.put("/updateAdmin/:id", verifyJWT, adminController.updateAdminCredentials);
app.put("/users/:id/block", verifyJWT, userController.blockUser);
app.put("/users/:id/unblock", verifyJWT, userController.unblockUser);

// app.put("/:id", expertController.updateExpert);
// app.delete("/:id", expertController.deleteExpert);

app.post("/init-payment", verifyJWT, paymentController.payment);
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
