const Job = require("../Models/Job");
const User = require("../Models/User");
const Expert = require("../Models/expert");
const sendEmail = require("../utils/sendEmail");

const createJob = async (req, res) => {
  try {
    const { clientId, expertId, carId, jobDescription, paymentStatus } =
      req.body;

    // Create a new job instance
    const job = new Job({
      client: clientId,
      expert: expertId,
      car: carId,
      jobDescription,
      paymentStatus,
    });

    // Save the job to the database
    await job.save();

    res.status(201).json({ success: true, data: job });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getJobsByExpertId = async (req, res) => {
  try {
    const expertId = req.params.expertId;

    // Find all jobs where expert matches the provided expertId
    const jobs = await Job.find({ expert: expertId })
      .populate("client", ["Nom", "Prenom", "Email"])
      .populate("car", [
        "photo",
        "prix",
        "marque",
        "model",
        "année",
        "location",
      ]);

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No jobs found for this expert" });
    }

    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getJobsByClientId = async (req, res) => {
  try {
    const clientId = req.params.clientId;

    // Find all jobs where expert matches the provided expertId
    const jobs = await Job.find({ client: clientId })
      .populate("expert", ["Nom", "Prenom", "Email", "prix"])
      .populate("car", [
        "photo",
        "prix",
        "marque",
        "model",
        "année",
        "location",
      ]);

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No jobs found for this client" });
    }

    res.status(200).json({ success: true, data: jobs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const acceptJob = async (req, res) => {
  const subject = "mise a jour de votre demand d'expertism";
  const message =
    "Nous tenons à vous informer que votre demande a été accepter par l'expert. :) ";

  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId)
      .populate("client", ["Email"]) // Only populate the Email field
      .exec();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const clientEmail = job.client.Email;

    job.accepted = "accepted";
    job.acceptDate = Date.now();
    await job.save();

    await emailSender(clientEmail, subject, message);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const rejectJob = async (req, res) => {
  const subject = "mise a jour de votre demand d'expertism";
  const message =
    "Nous tenons à vous informer que votre demande a été rejetée par l'expert. Nous comprenons que cela puisse être décevant, mais nous vous encourageons à ne pas vous inquiéter. Vous pouvez toujours demander un autre expertism.";

  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId)
      .populate("client", ["Email"]) // Only populate the Email field
      .exec();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    const clientEmail = job.client.Email;

    job.accepted = "rejected";
    await job.save();

    await emailSender(clientEmail, subject, message);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const emailSender = async (email, subject, message) => {
  // const subject = "Code de vérification pour votre inscription";
  // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

  try {
    await sendEmail(email, subject, message);
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
  createJob,
  getJobsByExpertId,
  acceptJob,
  rejectJob,
  getJobsByClientId,
};
