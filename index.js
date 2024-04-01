const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const verifyJWT = require("./middleware/verifyJWT");
const router = express.Router();
const upload = require('./multer-config');



// Import controllers
const userController = require("./Routers/UserRouter");
const carAdController = require("./Routers/CarAdRoute");
const expertController = require("./Routers/ExpertRoute");
const adminController = require("./Routers/AdminRoute");
const logoutController = require("./controllers/logoutController");
const refreshTokenController = require("./controllers/refreshTokenController");

dotenv.config();

const port = process.env.PORT;
const app = express();

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());

//* authentication routes
app.post("/login", userController.login);
app.post("/register", userController.register);
app.post("/verify", userController.verifyRouteHandler);
app.get("/logout", logoutController.handleLogout);
app.get("/refresh", refreshTokenController.handleRefreshToken);


app.get("/getUserData", userController.getUserData);
app.put("/updateUserData/:id", userController.updateUserData);

app.get("/getAllUsers",verifyJWT, userController.getAllUsers);
app.get("/getUser/:id", userController.getUserById);

//* car routes
//app.post("/carAds", carAdController.createCarAd);
app.post("/carAds", upload.single('photo'), carAdController.createCarAd);


app.get("/carAds", carAdController.getAllCarAds);
app.put("/carAds/:id", carAdController.updateCarAd);
app.delete("/carAds/:id", carAdController.deleteCarAd);
app.get("/carAds/:id", carAdController.getCarAdById);
app.get("/carAds/search", carAdController.searchCarAds);
app.put("/:id/specialite", expertController.updateSpecialite);
app.get("/experts", expertController.getAllExperts);

app.put("/:id/bloquer", expertController.bloquerExpert);

//* admin routes
app.post("/adminLogin", adminController.adminLogin);
app.put("/updateAdmin/:id",verifyJWT, adminController.updateAdminCredentials);
app.put("/approuverExpert/:id",verifyJWT, expertController.approuverExpert);
app.get("/getPendingExperts",verifyJWT, userController.getPendingExperts);
app.put("/users/:id/block",verifyJWT, userController.blockUser); 
app.put("/users/:id/unblock",verifyJWT, userController.unblockUser); 

app.put("/:id", expertController.updateExpert);

app.delete("/:id", expertController.deleteExpert);

app.get("/", (req, res) => {
  res.send("Server is running");
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database");
    // Start server
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error(err.message);
  });
