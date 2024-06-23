const { response } = require("express");
const Job = require("../Models/Job");
const User = require("../Models/User");
const Expert = require("../Models/expert");
const emailSender = require("../utils/sendEmail");
const { payment } = require("./paymentController");
const path = require("path");
const fs = require("fs");

const createJob = async (req, res) => { // demande d'expertise 
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

const getJobsByExpertId = async (req, res) => { // voir led demande s'expertise par les experts 
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "submitDate";
    const sortOrder = parseInt(req.query.sortOrder) || -1;
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
      ])
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalJobs = await Job.countDocuments({ expert: expertId });

    if (!jobs || jobs.length === 0) {
      return res
        .status(404)
        .json({
          success: false,
          message: "Vous n'avez reçu aucune demande d'expertise",
        });
    }

    res.status(200).json({
      success: true,
      data: jobs,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getJobById = async (req, res) => { // l'expertisme
  try {
    const jobId = req.params.id; // Corrected variable name

    // Find the job by jobId and populate related fields
    const job = await Job.findById(jobId)
      .populate("client", ["Nom", "Prenom", "Email"])
      .populate("car", [
        "photos",
        "photo",
        "prix",
        "titre",
        "location",
        "description",
      ]);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("Error fetching job:", error); // More detailed error logging
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getJobsByClientId = async (req, res) => { // les demandes d'expertisme envoyées 
  try {
    const clientId = req.params.clientId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || "submitDate";
    const sortOrder = parseInt(req.query.sortOrder) || -1;

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
      ])
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit);

    const totalJobs = await Job.countDocuments({ client: clientId });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Vous n'avez initié aucune demande d'expertise",
      });
    }

    res.status(200).json({
      success: true,
      data: jobs,
      totalPages: Math.ceil(totalJobs / limit),
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const acceptJob = async (req, res) => { // accepter expertise
  try {
    const jobId = req.params.jobId;

    const job = await Job.findById(jobId)
      .populate({
        path: "expert",
        select: "ExpertId",
        populate: {
          path: "ExpertId",
          select: "konnect_link prix",
        },
      })
      .populate("client", "Email")
      .exec();

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // const message =
    //   "Nous tenons à vous informer que votre demande a été accepter par l'expert. :) Vous pouvez payer via: " +
    //   job.expert.ExpertId.konnect_link;
    const clientEmail = job.client.Email;

    job.accepted = "accepted";
    job.acceptDate = Date.now();

    // await emailSender(clientEmail, subject, message);

    const paymentReqBody = {
      type: "expert consultation",
      amount: job.expert.ExpertId.prix,
      expertId: job.expert._id,
      jobId: job._id,
      userId: job.client._id,
    };

    const paymentResponse = await payment({ body: paymentReqBody }, res);

    job.paymentLink = paymentResponse.payUrl;
    await job.save();

    console.log(paymentResponse);
    console.log(paymentResponse.payUrl);
    const currentDate = new Date(Date.now());
    const formattedDate = currentDate.toLocaleDateString();
    const variables = {
      type: "expert consultation",
      total: job.expert.ExpertId.prix,
      amount: job.expert.ExpertId.prix,
      transactionDate: formattedDate,
      paymentLink: paymentResponse.payUrl,
    };

    const subject = "Mise à jour de votre demande d'expertise";

    await emailSender(clientEmail, subject, variables);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const rejectJob = async (req, res) => { // rejeter expertise
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

    const variables = {
      type: "general notification",
      message: message,
      Date: new Date(Date.now()).toLocaleDateString(),
    };

    await emailSender(clientEmail, subject, variables);

    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const cancelJob = async (req, res) => { // l'utilisateur annuler sa demande 
  try {
    const jobId = req.params.jobId;

    // Find the job by jobId
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Update job status to cancelled
    job.accepted = "cancelled";
    await job.save();

    res
      .status(200)
      .json({ success: true, message: "Job cancelled successfully" });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const getAssignedExpertIdsForCarAndClient = async (req, res) => { // menjmsh n3awed demande l nefs expert nefs l karhba 
  const carAdId = req.params.carAdId;
  const client = req.userId;
  try {
    const jobs = await Job.find({ client: client, car: carAdId });
    const expertIds = jobs.map((job) => job.expert);
    console.log(expertIds);
    res.json(expertIds);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const sendMessage = async (req, res) => {
  const jobId = req.params.id;
  const { sender, message } = req.body;

  try {
    // Find the job by jobId
    const job = await Job.findById(jobId);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Add the new message to the chat array
    job.chat.push({ sender, message });

    // Save the updated job
    await job.save();

    res
      .status(201)
      .json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const uploadDocuments = async (req, res) => { //rapport 
  try {
    const jobId = req.params.id;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const files = req.files.map((file) => file.filename);
    job.documents.push(...files);
    await job.save();
    res.status(200).json({ success: true, data: job });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const deleteDocument = async (req, res) => { // supp rapport
  try {
    const jobId = req.params.id;
    const fileName = req.params.fileName;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }
    const filePath = path.join(__dirname, "../public/uploads", fileName);
    fs.unlink(filePath, async (err) => {
      if (err) {
        console.error("Error deleting file:", err);
        return res
          .status(500)
          .json({ success: false, error: "Error deleting file" });
      }
      job.documents = job.documents.filter((doc) => doc !== fileName);
      await job.save();
      res
        .status(200)
        .json({ success: true, message: "File deleted successfully" });
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

const fetchAllDocuments = async (req, res) => { // afficher les rapport ou photo
  try {
    const jobs = await Job.find({ documents: { $ne: [] } }).select("documents");
    const files = jobs.reduce((acc, job) => acc.concat(job.documents), []);
    res.status(200).json({ success: true, data: files });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// const emailSender = async (email, subject, variables) => {
//   //! ___REMEMBER_TO_PUT_THIS_INTO_A_SEPARATE_FILE_AND_IMPORT_IT___
//   // const subject = "Code de vérification pour votre inscription";
//   // const message = `Votre code de vérification est : ${code}. Utilisez ce code pour finaliser votre inscription.`;

//   try {
//     await sendEmail(email, subject, variables);
//     console.log("E-mail de notification envoyé avec succès");
//   } catch (error) {
//     console.error(
//       "Erreur lors de l'envoi de l'e-mail de notification :",
//       error
//     );
//     throw new Error("Erreur lors de l'envoi de l'e-mail de notification");
//   }
// };

module.exports = {
  createJob,
  getJobsByExpertId,
  getJobById,
  acceptJob,
  rejectJob,
  getJobsByClientId,
  getAssignedExpertIdsForCarAndClient,
  sendMessage,
  cancelJob,
  uploadDocuments,
  fetchAllDocuments,
  deleteDocument,
};
