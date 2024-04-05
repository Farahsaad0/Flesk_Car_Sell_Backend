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

let getOneSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await Subscription.findById(id);

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json(subscription);
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    res.status(500).json({ error: "Failed to retrieve subscription" });
  }
};

let updateSubscription = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, price, duration, features, isActive } = req.body;

    const updatedSubscription = await Subscription.findByIdAndUpdate(
      id,
      { type, price, duration, features, isActive },
      { new: true }
    );

    if (!updatedSubscription) {
      return res.status(404).json({ error: "Subscription not found" });
    }

    res.status(200).json(updatedSubscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Failed to update subscription" });
  }
};

module.exports = {
  createSubscription,
  getAllSubscriptions,
  getOneSubscription,
  updateSubscription,
};
