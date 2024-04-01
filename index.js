const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const upload = require('./multer-config');



// Import controllers
const userController = require("./Routers/UserRouter");
const carAdController = require("./Routers/CarAdRoute");
const expertController = require("./Routers/ExpertRoute");
const adminController = require("./Routers/AdminRoute");

 
dotenv.config();
 
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

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error(err.message);
  });

//* authentication routes
app.post("/login", userController.login);
app.post("/register", userController.register);
app.post("/verify", userController.verifyRouteHandler);


app.get("/getUserData", userController.getUserData);
app.put("/updateUserData/:id", userController.updateUserData);

app.get("/getAllUsers", userController.getAllUsers);
app.get("/getPendingExperts", userController.getPendingExperts);
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
app.put("/updateAdmin/:id", adminController.updateAdminCredentials);
app.put("/approuverExpert/:id", expertController.approuverExpert);

app.put("/:id", expertController.updateExpert);

app.delete("/:id", expertController.deleteExpert);

app.get("/", (req, res) => {
  res.send("Server is running");
});

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
