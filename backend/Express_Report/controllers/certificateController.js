const express = require("express");
const axios = require("axios");
const router = express.Router();
const StudentCertificate = require("../models/certificate");
const Consul = require("consul");
// Initialize Consul properly
const consul = new Consul({ host: "localhost", port: 8500 });
// Function to get Module Service URL from Consul

require("dotenv").config();


const CONSUL_HOST = process.env.CONSUL_HOST || "localhost";
const CONSUL_PORT = 8500; // Consul's default port
const CONSUL_BASE_URL = `http://${CONSUL_HOST}:${CONSUL_PORT}/v1/catalog/service`;

// Function to fetch service URL dynamically from Consul
const getServiceUrl = async (serviceName, path = "") => {
  try {
    const response = await axios.get(`${CONSUL_BASE_URL}/${serviceName}`);
    const services = response.data;

    if (!services.length) {
      throw new Error(`Service ${serviceName} not found in Consul`);
    }

    const { ServiceAddress, ServicePort } = services[0];
    const host = ServiceAddress || "localhost"; // Fallback to localhost
    return `http://${host}:${ServicePort}${path}`;
  } catch (error) {
    console.error(`❌ Error fetching ${serviceName} service URL:`, error.message);
    return null;
  }
};

// Get URLs dynamically
const getModuleServiceUrl = async () => await getServiceUrl("Express_Mod", "/modules");
const getUserServiceUrl = async () => await getServiceUrl("Express_User", "/user");
const getResultServiceUrl = async () => await getServiceUrl("Express_Report", "/results");

// Test fetching service URLs
(async () => {
  console.log("Module Service URL:", await getModuleServiceUrl());
  console.log("User Service URL:", await getUserServiceUrl());
  console.log("Result Service URL:", await getResultServiceUrl());
})();



router.get("/certificate-with-result/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const certificates = await StudentCertificate.find({ certificate_user_id: userId }).lean();

    if (!certificates || certificates.length === 0) {
      return res.status(404).json({ message: "No certificates found for this user" });
    }

    const resultServiceUrl = await getResultServiceUrl();
    if (!resultServiceUrl) {
      return res.status(500).json({ message: "Result service unavailable" });
    }

    // Fetch result details
    let resultDetails = null;
    try {
      const resultResponse = await axios.get(`${resultServiceUrl}/get-result-by-user-id/${userId}`);
      resultDetails = resultResponse.data.length ? resultResponse.data : null;
    } catch (error) {
      console.warn(`⚠ Result details not found for User ID ${userId}`);
    }

    // Attach result details to each certificate
    const certificatesWithResults = certificates.map((certificate) => ({
      ...certificate,
      resultDetails,
    }));

    res.json(certificatesWithResults);
  } catch (error) {
    console.error("❌ Error fetching certificate with result details:", error.message);
    res.status(500).json({ message: "Error fetching certificate", error: error.message });
  }
});
router.get("/all-certificates-with-results", async (req, res) => {
  try {
    const certificates = await StudentCertificate.find().lean(); // Fetch all certificates in JSON format
    const resultServiceUrl = await getResultServiceUrl();

    if (!resultServiceUrl) {
      return res.status(500).json({ message: "Result service unavailable" });
    }

    // Fetch results asynchronously for each certificate
    const certificatesWithResults = await Promise.all(
      certificates.map(async (certificate) => {
        let resultDetails = null;

        try {
          const resultResponse = await axios.get(`${resultServiceUrl}/get-result-by-user-id/${certificate.certificate_user_id}`);
          resultDetails = resultResponse.data.length ? resultResponse.data : null;
        } catch (error) {
          console.warn(`⚠ Result details not found for User ID ${certificate.certificate_user_id}`);
        }

        return { ...certificate, resultDetails };
      })
    );

    res.json(certificatesWithResults);
  } catch (error) {
    console.error("❌ Error fetching certificates with result details:", error);
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
});
// GET - Fetch All Certificates with User Details
router.get("/all-certificates-with-users", async (req, res) => {
  try {
    const certificates = await StudentCertificate.find();
    const userServiceUrl = await getUserServiceUrl();

    if (!userServiceUrl) {
      return res.status(500).json({ message: "User service unavailable" });
    }

    // Fetch user details for each certificate
    const certificatesWithUsers = await Promise.all(certificates.map(async (certificate) => {
      let userDetails = null;
      try {
        const userResponse = await axios.get(`${userServiceUrl}/get_user_by_id/${certificate.certificate_user_id}`);
        userDetails = userResponse.data;
      } catch (error) {
        console.warn(`⚠ User details not found for ID ${certificate.certificate_user_id}`);
      }

      return { ...certificate._doc, userDetails };
    }));

    res.json(certificatesWithUsers);
  } catch (error) {
    console.error("❌ Error fetching certificates with user details:", error.message);
    res.status(500).json({ message: "Error fetching certificates", error: error.message });
  }
});
// GET - Fetch  Certificate id with User id
router.get("/certificate_id_with_user_id/:id", async (req, res) => {
  try {
    const certificate = await StudentCertificate.findOne({ certificate_user_id: req.params.id });

    if (!certificate) {
      return res.status(404).json({ message: "❌ Certificate not found" });
    }

    const userServiceUrl = await getUserServiceUrl();
    if (!userServiceUrl) {
      return res.status(500).json({ message: "User service unavailable" });
    }

    let userDetails = null;
    try {
      const { data } = await axios.get(`${userServiceUrl}/get_user_by_id/${certificate.certificate_user_id}`);
      userDetails = data;
    } catch (error) {
      console.warn(`⚠ User details not found for ID ${certificate.certificate_user_id}`);
    }

    res.json({ ...certificate._doc, userDetails });
  } catch (error) {
    console.error("❌ Error fetching certificate:", error.message);
    res.status(500).json({ message: "Error fetching certificate", error: error.message });
  }
});
// POST - Add a New Certificate
router.post("/post-certificates", async (req, res) => {
  try {
    const { certificate_user_id, certificate_mod_id, certificate_poc_id } = req.body;

    // Generate a random 6-digit certificate_id
    const certificate_id = Math.floor(100000 + Math.random() * 900000);

    // Generate current date in "dd/mm/yyyy" format
    const currentDate = new Date();
    const certificate_generated_date = `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;

    const newCertificate = new StudentCertificate({
      certificate_id,
      certificate_user_id,
      certificate_mod_id,
      certificate_poc_id,
      certificate_generated_date,
      certificate_url: "",
    });

    await newCertificate.save();
    res.status(201).json({ message: "✅ Certificate added successfully", certificate: newCertificate });
  } catch (error) {
    console.error("❌ Error adding certificate:", error.message);
    res.status(500).json({ message: "Error adding certificate", error: error.message });
  }
});
// GET - Fetch All Certificates with Module Details
router.get("/all_certificates_with_module", async (req, res) => {
  try {
    const certificates = await StudentCertificate.find();
    const moduleServiceUrl = await getModuleServiceUrl(); // Get URL

    if (!moduleServiceUrl) {
      return res.status(500).json({ message: "Module service unavailable" });
    }

    // Fetch module details for each certificate
    const certificatesWithModules = await Promise.all(certificates.map(async (certificate) => {
      try {
        const moduleResponse = await axios.get(`${moduleServiceUrl}/get_module_by_id/${certificate.certificate_mod_id}`);
        return { ...certificate._doc, moduleDetails: moduleResponse.data };
      } catch (error) {
        console.error("Error fetching module details:", error.message);
        return { ...certificate._doc, moduleDetails: null }; // Set to null if fetch fails
      }
    }));

    res.json(certificatesWithModules);
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificates", error });
  }
});
// GET - Fetch Single Certificate with Module Details
router.get("/certificate_mod_id_with_module_id/:id", async (req, res) => {
  try {
    const certificate = await StudentCertificate.findOne({ certificate_mod_id: req.params.id });

    if (!certificate) {
      return res.status(404).json({ message: "❌ Certificate not found" });
    }

    const moduleServiceUrl = await getModuleServiceUrl();
    if (!moduleServiceUrl) {
      return res.status(500).json({ message: "Module service unavailable" });
    }

    let moduleDetails = null;
    try {
      const { data } = await axios.get(`${moduleServiceUrl}/get_module_by_id/${certificate.certificate_mod_id}`);
      moduleDetails = data;
    } catch (error) {
      console.warn(`⚠ Module details not found for ID ${certificate.certificate_mod_id}`);
    }

    res.json({ ...certificate._doc, moduleDetails });
  } catch (error) {
    console.error("❌ Error fetching certificate:", error.message);
    res.status(500).json({ message: "Error fetching certificate", error: error.message });
  }
});
// Update certificate (PUT) - Now using req.body instead of req.params
router.put("/update-certificates", async (req, res) => {
  try {
    const { certificate_id, ...updateData } = req.body;

    const updatedCertificate = await StudentCertificate.findOneAndUpdate(
      { certificate_id },
      updateData,
      { new: true }
    );

    if (!updatedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate updated successfully", certificate: updatedCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error updating certificate", error });
  }
});
// DELETE - Remove a Certificate
router.delete("/delete-by-cert-user-id/:certificate_user_id", async (req, res) => {
  try {
    const { certificate_user_id } = req.params;

    const deletedCertificate = await StudentCertificate.findOneAndDelete({ certificate_user_id });

    if (!deletedCertificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    res.json({ message: "Certificate deleted successfully", certificate: deletedCertificate });
  } catch (error) {
    res.status(500).json({ message: "Error deleting certificate", error });
  }
});
module.exports = router;
