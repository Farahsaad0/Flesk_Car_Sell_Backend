const Subscription = require("../Models/Subscription");

let createNewSubscription = async (req, res) => {
  if (!req?.body?.type || !req?.body?.price || !req?.body?.features) {
    return res.status(400).json({ message: "all fields are required!" });
  }
};
