const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Import controllers
const userController = require("./Routers/UserRouter");
const carAdController = require("./Routers/CarAdRoute");
const expertController = require("./Routers/ExpertRoute");
const adminController = require("./Routers/AdminRoute");

dotenv.config();

const app = express();

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

app.post("/login", userController.login);
app.post("/register", userController.register);
app.post("/verify", userController.verifyRouteHandler);
app.get("/getAllUsers", userController.getAllUsers);
app.get("/getPendingExperts", userController.getPendingExperts);
app.get("/getUser/:id", userController.getUserById);

app.post("/carAds", carAdController.createCarAd);
app.get("/carAds", carAdController.getAllCarAds);
app.put("/carAds/:id", carAdController.updateCarAd);
app.delete("/carAds/:id", carAdController.deleteCarAd);
app.get("/carAds/:id", carAdController.getCarAdById);
app.get("/carAds/search", carAdController.searchCarAds);
app.put("/:id/specialite", expertController.updateSpecialite);
app.get("/experts", expertController.getAllExperts);

app.put("/:id/bloquer", expertController.bloquerExpert);

app.post("/adminLogin", adminController.adminLogin);

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
 