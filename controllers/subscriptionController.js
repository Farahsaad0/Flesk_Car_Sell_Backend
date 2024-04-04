const Subscription = require("../Models/Subscription");

let createSubscription = async (req, res) => {
  try {
    const { type, price, duration, features, isActive } = req.body;

    const newSubscription = new Subscription({
      type,
      price,
      duration,
      features,
      isActive,
    });

    const savedSubscription = await newSubscription.save();

    res.status(201).json(savedSubscription); 
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Failed to create subscription" });
  }
};

let getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();

    res.status(200).json(subscriptions); 
  } catch (error) {
    console.error("Error retrieving subscriptions:", error);
    res.status(500).json({ error: "Failed to retrieve subscriptions" });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
};
