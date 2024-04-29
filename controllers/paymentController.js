const axios = require("axios");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const Transaction = require("../Models/transaction");
const sendEmail = require("../utils/sendEmail");
const Subscription = require("../Models/Subscription");

const payment = async (req, res) => {
  let receivedData = req.body;

  // if (
  //   !receivedData.amount ||
  //   !Number.isFinite(receivedData.amount) ||
  //   receivedData.amount <= 99
  // ) {
  //   return res.status(400).json({ message: "Invalid amount" });
  // }
  let userId = receivedData.userId;
  // try {
  //   const isValid = jwt.verify(receivedData.userToken, process.env.JWT_PASS);
  //   const decoded = jwt.decode(receivedData.userToken);
  //   if (!isValid || !decoded || !decoded.userId) {
  //     throw new Error("Invalid or outdated token");
  //   }
  //   console.log(decoded.userId);
  //   userId = decoded.userId;
  // } catch (err) {
  //   return res.status(401).json({ message: "Invalid userToken" });
  // }

  const sponsorship = await Subscription.findById(receivedData.subscription);
  const amount = sponsorship.price * 10;
  
  const paymentData = {
    receiverWalletId: process.env.RECEIVER_WALLET_ID,
    token: "TND",
    amount: amount,
    type: "immediate",
    description: "payment description",
    acceptedPaymentMethods: ["wallet", "bank_card", "e-DINAR", "flouci"],
    lifespan: 10,
    checkoutForm: false,
    addPaymentFeesToAmount: false,
    orderId: "1234657",
    webhook: "https://8n7vlqww-8000.euw.devtunnels.ms/konnect/webhook",
    silentWebhook: true,
    successUrl: "https://8n7vlqww-3000.euw.devtunnels.ms/create-ad",
    failUrl: "https://dev.konnect.network/gateway/payment-failure",
    theme: "light",
  };

  try {
    const config = {
      headers: {
        "x-api-key": process.env.KONNECT_API_KEY,
      },
    };

    const response = await axios.post(
      `${process.env.KONNECT_API_URL}/init-payment`,
      paymentData,
      config
    );
    console.log(sponsorship.type)
    const transaction = new Transaction({
      userId: userId,
      amount: amount,
      paymentStatus: "pending",
      paymentId: response.data.paymentRef,
      sponsorship: sponsorship.type,
    });

    await transaction.save();

    res.json(response.data);
  } catch (error) {
    // Handle specific errors returned by Konnect API
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return res.status(error.response.status).json({
        message: "Error from Konnect API",
        error: error.response.data,
      });
    } else if (error.request) {
      // The request was made but no response was received
      return res.status(500).json({ message: "No response from Konnect API" });
    } else {
      // Something else happened while setting up the request
      return res
        .status(500)
        .json({ message: "Error initializing payment _________ ", error });
    }
  }
};

const payment_update = async (req, res) => {
  const paymentRef = req.query.payment_ref;
  try {
    const config = {
      headers: {
        "x-api-key": process.env.KONNECT_API_KEY,
      },
    };

    const response = await axios.get(
      `${process.env.KONNECT_API_URL}/${paymentRef}`,
      config
    );

    const status = response.data.payment.status;
    const transaction = await Transaction.findOne({
      paymentId: paymentRef,
    }).populate("userId", ["Email"]);
    if (transaction) {
      transaction.paymentStatus = status;
      await transaction.save();
    }

    const subject = "Votre Reçue de transaction";
    const amount = transaction.amount;
    const clientEmail = transaction.userId.Email;
    const message = `votre transaction de mentent: ${amount} a éte effectuer avec sucées.`;

    res.status(200).json({ message: "Payment status updated" });

    console.log(response.data);
    const variables = {
      total: response.data.payment.amount,
      amount: response.data.payment.amount,
      transactionDate: new Date(
        response.data.payment.updatedAt
      ).toLocaleDateString(),
      subscription: "Premium Subscription",
    };

    await emailSender(clientEmail, subject, variables);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Error updating payment status" });
  }
};

const emailSender = async (email, subject, variables) => {
  //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
  // const subject = "Code de vérification pour votre inscription";
  // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

  try {
    await sendEmail(email, subject, variables);
    console.log("E-mail de notification envoyé avec succès");
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi de l'e-mail de notification :",
      error
    );
    throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
  }
};

module.exports = {
  payment,
  payment_update,
};
