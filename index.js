const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const userController = require("./Routers/UserRouter"); // Update import paths
const carAdController = require("./Routers/CarAdRoute"); // Update import paths
const expertController = require("././Routers/ExpertRoute");

const cors = require("cors");
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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

app.post("/carAds", carAdController.createCarAd);
app.get("/carAds", carAdController.getAllCarAds);
app.put("/carAds/:id", carAdController.updateCarAd);
app.delete("/carAds/:id", carAdController.deleteCarAd);
app.get("/carAds/:id", carAdController.getCarAdById);
app.get("/carAds/search", carAdController.searchCarAds);
app.put("/:id/specialite", expertController.updateSpecialite);
app.get("/experts", expertController.getAllExperts);

app.put("/:id/bloquer", expertController.bloquerExpert);

app.put("/:id/approuver", expertController.approuverExpert);

app.put("/:id", expertController.updateExpert);

app.delete("/:id",expertController. deleteExpert);

app.get("/", (req, res) => {
  res.send("server is starting");
});

const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server start at http://localhost:${port}`);
});
