const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { default: mongoose } = require("mongoose");
const userController = require("././Routers/UserRouter");
const carAdController = require("././Routers/CarAdRoute");
const cors = require("cors");
dotenv.config();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware CORS
app.use(cors());

mongoose;
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

app.post("/carAds", carAdController.createCarAd);
app.get("/carAds", carAdController.getAllCarAds);
app.put("/carAds/:id", carAdController.updateCarAd);
app.delete("/carAds/:id", carAdController.deleteCarAd);
app.get("/carAds/:id", carAdController.getCarAdById);
app.get("/carAds/search", carAdController.searchCarAds);

app.get("/", (req, res) => {
  res.send("server is starting");
});


const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`server start at http://localhost:${port}`);
});
