const express = require("express");
const Poc = require("../models/Poc");
const router = express.Router();
const admin = require("firebase-admin");
const consul = require("../middleware/consul");
const axios = require("axios");
const moment = require("moment");

console.log("Project ID:", process.env.FIREBASE_PROJECT_ID);
console.log("Client Email:", process.env.FIREBASE_CLIENT_EMAIL);
console.log("Private Key:", process.env.FIREBASE_PRIVATE_KEY);

// add_poc
router.post("/add_poc", async (req, res) => {
  try {
    const poc = new Poc(req.body);
    await poc.save();
    res.status(201).send(poc);
  } catch (error) {
    res.status(400).send(error);
  }
});

// read_all_poc
router.get('/read_all_poc', async (req, res) => {
  try {
    const pocs = await Poc.find();
    res.status(200).json(pocs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs", error: error.message });
  }
});


// read_all_poc name 
router.get('/read_all_poc_name', async (req, res) => {
  try {
    const pocs = await Poc.find();
    res.status(200).json(pocs.map(poc => ({
      mod_poc_id: poc.mod_poc_id,
      mod_poc_name: poc.mod_poc_name
    })));
  } catch (error) {
    res.status(500).json({ message: "Error fetching POCs", error: error.message });
  }
});


// get_poc_by_poc_id
router.get('/get_poc_by_poc_id/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });
    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });
    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});

router.put("/update_poc", async (req, res) => {
  try {
    const { mod_poc_id } = req.body;
    if (!mod_poc_id) return res.status(400).json({ message: "mod_poc_id is required" });

    console.log('Received update request for POC:', JSON.stringify(req.body, null, 2));

    const existingPoc = await Poc.findOne({ mod_poc_id });
    if (!existingPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    console.log('Existing POC mod_users:', existingPoc.mod_users);

    const updateOperations = {};

    if (req.body.mod_id !== undefined) {
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_id = req.body.mod_id;
    }

    if (req.body.mod_poc_name !== undefined) {
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_poc_name = req.body.mod_poc_name;
    }

    if (req.body.mod_poc_role !== undefined) {
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_poc_role = req.body.mod_poc_role;
    }

    if (req.body.mod_poc_email !== undefined) {
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_poc_email = req.body.mod_poc_email;
    }

    if (req.body.mod_poc_mobile !== undefined) {
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_poc_mobile = req.body.mod_poc_mobile;
    }

    if (req.body.poc_certificate !== undefined && typeof req.body.poc_certificate === 'object') {
      updateOperations.$set = updateOperations.$set || {};
      if (req.body.poc_certificate.cert_status !== undefined) {
        updateOperations.$set['poc_certificate.cert_status'] = req.body.poc_certificate.cert_status;
        if (!existingPoc.poc_certificate || !existingPoc.poc_certificate.cert_id) {
          updateOperations.$set['poc_certificate.cert_id'] = `${mod_poc_id}`;
        }
      } else {
        if (!req.body.poc_certificate.cert_id) {
          return res.status(400).json({ message: "cert_id is required when updating entire poc_certificate" });
        }
        updateOperations.$set.poc_certificate = req.body.poc_certificate;
      }
    }

    if (req.body.mod_images && Array.isArray(req.body.mod_images) && req.body.mod_images.length > 0) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.mod_images = { $each: req.body.mod_images };
    }

    if (req.body.mod_tests && Array.isArray(req.body.mod_tests) && req.body.mod_tests.length > 0) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.mod_tests = { $each: req.body.mod_tests };
    }

    if (req.body.mod_users && Array.isArray(req.body.mod_users)) {
      // Temporary: Skip validation for debugging
      /*
      if (req.body.mod_users.length > 0) {
        const validUsers = await User.find({ user_id: { $in: req.body.mod_users } }).select('user_id');
        const validUserIds = validUsers.map(user => user.user_id);
        const invalidUserIds = req.body.mod_users.filter(id => !validUserIds.includes(id));
        if (invalidUserIds.length > 0) {
          console.error('Invalid user_ids detected:', invalidUserIds);
          return res.status(400).json({ message: `Invalid user_ids: ${invalidUserIds.join(', ')}` });
        }
      }
      */
      updateOperations.$set = updateOperations.$set || {};
      updateOperations.$set.mod_users = req.body.mod_users.map(id => String(id)); // Ensure string
      console.log('Setting mod_users to:', updateOperations.$set.mod_users);
    }

    if (req.body.attendance && Array.isArray(req.body.attendance) && req.body.attendance.length > 0) {
      updateOperations.$push = updateOperations.$push || {};
      updateOperations.$push.attendance = { $each: req.body.attendance };
    }

    if (req.body.certificates && typeof req.body.certificates === 'object') {
      Object.entries(req.body.certificates).forEach(([key, value]) => {
        updateOperations.$set = updateOperations.$set || {};
        updateOperations.$set[`certificates.${key}`] = value;
      });
    }

    if (Object.keys(updateOperations).length === 0) {
      return res.status(400).json({ message: "No valid update data provided" });
    }

    console.log('Update Operations:', JSON.stringify(updateOperations, null, 2));

    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id },
      updateOperations,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('Updated POC mod_users:', updatedPoc.mod_users);

    res.json(updatedPoc);
  } catch (error) {
    console.error('Error updating POC:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

// Updated to allow empty test_id array

router.put("/update_test", async (req, res) => {
  try {
    const { mod_poc_id, test_id } = req.body; // Changed from 'tests' to 'test_id' to match request

    if (!mod_poc_id || !Array.isArray(test_id) || test_id.length === 0) {
      return res.status(400).json({ 
        message: "mod_poc_id and test_id (non-empty array of {test_id, assigned_date}) are required" 
      });
    }

    // Validate test objects
    const invalidTests = test_id.some(test => !test.test_id || !test.assigned_date);
    if (invalidTests) {
      return res.status(400).json({ 
        message: "Each test must have test_id and assigned_date" 
      });
    }

    const existingPoc = await Poc.findOne({ mod_poc_id });
    if (!existingPoc) return res.status(404).json({ 
      message: "POC not found with the provided mod_poc_id" 
    });

    existingPoc.mod_tests = test_id; // Assign the array directly since it matches the schema
    await existingPoc.save();

    res.status(200).json({ 
      message: "POC tests updated successfully", 
      updated_tests: existingPoc.mod_tests 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: error.message 
    });
  }
});


// router.put("/update_test", async (req, res) => {
//   try {
//     const { mod_poc_id, test_id } = req.body;

//     if (!mod_poc_id || !Array.isArray(test_id)) {
//       return res.status(400).json({
//         message: "mod_poc_id and test_id (array of {test_id, assigned_date}) are required"
//       });
//     }

//     // Validate test objects only if array is not empty
//     if (test_id.length > 0) {
//       const invalidTests = test_id.some(test => !test.test_id || !test.assigned_date);
//       if (invalidTests) {
//         return res.status(400).json({
//           message: "Each test must have test_id and assigned_date"
//         });
//       }
//     }

//     const existingPoc = await Poc.findOne({ mod_poc_id });
//     if (!existingPoc) {
//       return res.status(404).json({
//         message: "POC not found with the provided mod_poc_id"
//       });
//     }

//     existingPoc.mod_tests = test_id; // Can now be an empty array
//     await existingPoc.save();

//     res.status(200).json({
//       message: "POC tests updated successfully",
//       updated_tests: existingPoc.mod_tests
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal Server Error",
//       error: error.message
//     });
//   }
// });


// No change needed - still clears the mod_tests array+

router.delete("/delete_test/:mod_poc_id", async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    poc.mod_tests = [];
    await poc.save();

    res.status(200).json({ message: "mod_tests deleted successfully", updatedPoc: poc });
  } catch (error) {
    res.status(500).json({ message: "Error deleting mod_tests", error: error.message });
  }
});

// No change needed - already handles mod_tests as an array
router.put("/update_mod_field", async (req, res) => {
  try {
    const { mod_poc_id, mod_tests, mod_users } = req.body;
    if (!mod_poc_id) return res.status(400).json({ message: "mod_poc_id is required" });

    const updatedPoc = await Poc.findOneAndUpdate(
      { mod_poc_id },
      { mod_tests, mod_users },
      { new: true, runValidators: true }
    );

    if (!updatedPoc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    res.json(updatedPoc);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// delete_poc
router.delete("/delete_poc/:mod_poc_id", async (req, res) => {
  try {
    const deletedPoc = await Poc.findOneAndDelete({ mod_poc_id: req.params.mod_poc_id });
    if (!deletedPoc) return res.status(404).send({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.send({ message: "POC deleted successfully", deletedPoc });
  } catch (error) {
    res.status(500).send(error);
  }
});

// mod_by_user
router.get("/mod_by_user/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id");
    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    res.json({ mod_id: module.mod_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updated to handle new mod_tests structure
router.get("/mod_and_poc/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id mod_poc_id mod_poc_name mod_tests");

    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    const tests = module.mod_tests || [];

    res.status(200).json({
      mod_id: module.mod_id,
      mod_poc_id: module.mod_poc_id,
      mod_poc_name: module.mod_poc_name,
      tests: tests // Return full test objects instead of just test_ids
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// mod_id_poc_id
router.get("/mod_id_poc_id/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const module = await Poc.findOne({ mod_users: user_id }, "mod_id mod_poc_id");
    if (!module) return res.status(404).json({ error: `No module found for user with ID ${user_id}` });

    res.status(200).json({ mod_id: module.mod_id, mod_poc_id: module.mod_poc_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get_poc_certificate_by_mod_id
router.get('/get_poc_certificate_by_mod_id/:mod_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_id: req.params.mod_id });
    if (!poc) return res.status(404).json({ message: `POC with Module ID ${req.params.mod_id} not found` });

    res.status(200).json({ poc_certificate: poc.poc_certificate });
  } catch (error) {
    res.status(500).json({ message: "Error fetching poc_certificate", error: error.message });
  }
});

// GET TEST BY TODAY'S DATE
router.get('/tests_today/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id }).lean();
    if (!poc) return res.status(404).json({ message: `POC with ID ${mod_poc_id} not found` });

    // Create today's date based on UTC
    const today = new Date();
    const utcToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    const todayTests = poc.mod_tests.filter(test => {
      // Parse the DD/MM/YYYY format
      const [day, month, year] = test.assigned_date.split('/').map(Number);
      const testDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      return testDate.getTime() === utcToday.getTime();
    }).map(test => test.test_id);

    return res.status(200).json({
      mod_poc_id,
      date: utcToday.toISOString(),
      test_ids: todayTests
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
});

// already handles new mod_tests structure correctly
router.get('/tests_till_today/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) return res.status(404).json({ message: "POC not found" });

    // Create today's date in UTC
    const today = new Date();
    const utcToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));

    const validTests = poc.mod_tests.filter(test => {
      // Parse the DD/MM/YYYY format
      const [day, month, year] = test.assigned_date.split('/').map(Number);
      const testDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
      
      return testDate.getTime() <= utcToday.getTime();
    });

    res.status(200).json({ tests_till_today: validTests });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
});

router.get('/get_all_tests/:mod_poc_id', async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    
    // Find POC by mod_poc_id and select only the mod_tests field
    const poc = await Poc.findOne({ mod_poc_id }, 'mod_tests');
    
    if (!poc) {
      return res.status(404).json({ 
        message: `POC with ID ${mod_poc_id} not found` 
      });
    }

    // Return the tests array, or empty array if none exist
    const tests = poc.mod_tests || [];

    res.status(200).json({
      mod_poc_id,
      tests
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error fetching tests", 
      error: error.message 
    });
  }
});

// Initialize Firebase Admin SDK (should be done once, typically in a separate config file)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      
    }),
    
  });
}

const db = admin.firestore();

// Unified endpoint for single and bulk certificate generation
// POST generate certificates
router.post("/generate-certificates", async (req, res) => {
  try {
    const { mod_poc_id, userIds } = req.body;

    if (!mod_poc_id) {
      return res.status(400).json({ message: "mod_poc_id is required" });
    }

    const userIdsArray = Array.isArray(userIds) ? userIds : typeof userIds === "string" ? [userIds] : [];
    if (userIdsArray.length === 0) {
      return res.status(400).json({ message: "userIds must be a non-empty string or array" });
    }

    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) {
      return res.status(404).json({ message: "Poc not found" });
    }

    const serviceName = "Express_User";
    const services = await consul.catalog.service.nodes(serviceName);
    if (!services || services.length === 0) {
      return res.status(500).json({ message: "No available service instances found in Consul" });
    }

    const { Address, ServicePort } = services[0]; // Use Address directly
    if (!Address || !ServicePort) {
      return res.status(500).json({ message: "Invalid service address from Consul" });
    }

    const results = [];
    const errors = [];

    for (const userId of userIdsArray) {
      try {
        if (!poc.mod_users.includes(userId)) {
          errors.push({ userId, message: "User not found in mod_users" });
          continue;
        }

        if (poc.certificates.has(userId)) {
          const existingCertificateId = poc.certificates.get(userId);
          results.push({
            userId,
            certificateId: existingCertificateId,
            message: "Certificate already generated for this user",
          });
          continue;
        }

        const targetUrl = `http://${Address}:${ServicePort}/user/get_user_by_id/${userId}`;
        const response = await axios.get(targetUrl);
        const user = response.data;

        if (!user || !user.full_name) {
          errors.push({ userId, message: "User details not found" });
          continue;
        }

        let newCertificateId;
        let attempts = 0;
        const maxAttempts = 5;

        while (attempts < maxAttempts) {
          const certPrefix = poc.poc_certificate.cert_id;
          const randomFiveDigit = Math.floor(10000 + Math.random() * 90000).toString();
          newCertificateId = `${certPrefix}${randomFiveDigit}`;

          const certificateRef = db.collection("certificates").doc(newCertificateId);
          const certificateDoc = await certificateRef.get();
          if (!certificateDoc.exists) {
            break;
          }
          attempts++;
        }

        if (attempts >= maxAttempts) {
          errors.push({ userId, message: "Failed to generate unique certificate ID after multiple attempts" });
          continue;
        }

        poc.certificates.set(userId, newCertificateId);
        const certificateRef = db.collection("certificates").doc(newCertificateId);
        await certificateRef.set({
          userId,
          certificateId: newCertificateId,
          mod_poc_id,
          full_name: user.full_name,
          rollno: user.rollno,
          department: user.department,
          college: user.college,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        results.push({
          userId,
          certificateId: newCertificateId,
          message: "Certificate generated successfully",
          updatedPoc: poc
        });
      } catch (error) {
        errors.push({ userId, message: error.message || "Error processing user" });
      }
    }

    await poc.save();

    if (userIdsArray.length === 1) {
      const result = results[0];
      const error = errors[0];
      if (result) {
        return res.status(200).json({
          message: result.message,
          certificateId: result.certificateId,
        });
      } else {
        return res.status(400).json({
          message: error.message,
        });
      }
    } else {
      return res.status(200).json({
        message: "Certificate generation completed",
        results,
        errors,
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

  // Retrieve Certificate ID using mod_poc_id
  router.get("/get-certificate/:pocId/:userId", async (req, res) => {
    try {
      const { pocId, userId } = req.params;

      // Use mod_poc_id instead of _id
      const poc = await Poc.findOne({ mod_poc_id: pocId });
      if (!poc) {
        return res.status(404).json({ message: "Poc not found" });
      }

      const certificateId = poc.certificates.get(userId);
      if (!certificateId) {
        return res.status(404).json({ message: "Certificate not found for this user" });
      }

      res.status(200).json({ certificateId });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

// CUSTOM CERTFICATE ID GENERATION
router.post("/assign-custom-certificates", async (req, res) => {
  try {
    const { mod_poc_id, certificates } = req.body;
    const authHeader = req.headers.authorization;

    // Validate input
    if (!mod_poc_id || !Array.isArray(certificates) || certificates.length === 0) {
      return res.status(400).json({
        message: "mod_poc_id and a non-empty certificates array are required",
      });
    }

    // Check if each entry has userId and certificateId
    for (const c of certificates) {
      if (!c.userId || !c.certificateId) {
        return res.status(400).json({
          message: "Each certificate entry must include userId and certificateId",
        });
      }
    }

    // Find the PoC
    const poc = await Poc.findOne({ mod_poc_id });
    if (!poc) {
      return res.status(404).json({ message: "PoC not found" });
    }

    // Discover the user service via Consul
    const serviceName = "Express_User";
    const services = await consul.catalog.service.nodes(serviceName);
    if (!services || services.length === 0) {
      return res.status(500).json({ message: "No available service instances found in Consul" });
    }

    const { Address, ServicePort } = services[0];

    const results = [];
    const errors = [];

    for (const { userId, certificateId } of certificates) {
      try {
        // Check if certificateId already exists in Firestore
        const certRef = db.collection("certificates").doc(certificateId);
        const certDoc = await certRef.get();
        if (certDoc.exists) {
          errors.push({ userId, certificateId, message: "certificateId already in use" });
          continue;
        }

        // Check if user is part of mod_users
        if (!poc.mod_users.includes(userId)) {
          errors.push({ userId, certificateId, message: "User not in mod_users" });
          continue;
        }

        // Check if user already has a certificate
        if (poc.certificates.has(userId)) {
          errors.push({ userId, certificateId, message: "User already has a certificate" });
          continue;
        }

        // Fetch user details with Authorization header
        const targetUrl = `http://${Address}:${ServicePort}/user/get_user_by_id/${userId}`;
        const response = await axios.get(targetUrl, {
          headers: {
            Authorization: authHeader,
          },
        });

        const user = response.data;
        if (!user || !user.full_name) {
          errors.push({ userId, certificateId, message: "User details not found" });
          continue;
        }

        // Save certificate in Firestore
        await certRef.set({
          userId,
          certificateId,
          mod_poc_id,
          full_name: user.full_name,
          rollno: user.rollno,
          department: user.department,
          college: user.college,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Update PoC with the new certificate mapping
        poc.certificates.set(userId, certificateId);

        results.push({ userId, certificateId, message: "Certificate issued successfully" });
      } catch (error) {
        errors.push({
          userId,
          certificateId,
          message: error.message || "Unexpected error",
        });
      }
    }

    // Save updated PoC
    await poc.save();

    // Final response
    return res.status(200).json({
      message: "Custom‑certificate generation finished",
      results,
      errors,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});


// Remove only certificate ID using mod_poc_id
router.delete("/remove-user/:pocId/:userId", async (req, res) => {
  try {
    const { pocId, userId } = req.params;

    const poc = await Poc.findOne({ mod_poc_id: pocId });
    if (!poc) {
      return res.status(404).json({ message: "Poc not found" });
    }

    if (!poc.certificates.has(userId)) {
      return res.status(404).json({ message: "Certificate not found for this user" });
    }

    poc.certificates.delete(userId);

    await poc.save();
    res.status(200).json({ message: "Certificate removed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update a User's Certificate ID (if the certificate is generated later)
router.put("/update-certificate", async (req, res) => {
  try {
    const { pocId, userId } = req.body;

    const newCertificateId = generateRandomCertificateId(); // 10-digit

    const poc = await Poc.findOne({ mod_poc_id: pocId });
    if (!poc) return res.status(404).json({ message: "Poc not found" });

    if (!poc.mod_users.includes(userId)) {
      return res.status(404).json({ message: "User not found in this Poc" });
    }

    poc.certificates.set(userId, newCertificateId);
    await poc.save();

    res.status(200).json({ message: "Certificate updated", certificateId: newCertificateId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


function generateRandomCertificateId() {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
}


// get_poc_cert_status
router.get('/get_poc_cert_status/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id }, { 'poc_certificate.cert_status': 1 });
    if (!poc) {
      return res.status(404).json({ message:` POC with ID ${req.params.mod_poc_id} not found` });
    }
    res.status(200).json({ cert_status: poc.poc_certificate.cert_status });
  } catch (error) {
    res.status(500).json({ message: "Error fetching certificate status", error: error.message });
  }
});


//////         reports //////////////

// Get POC report by mod_poc_id
router.get("/get_poc_report_by_poc_id/:mod_poc_id", async (req, res) => {
  try {
    const { mod_poc_id } = req.params;
    const poc = await Poc.findOne({ mod_poc_id }, { report: 1, _id: 0 });
    if (!poc || !poc.report) {
      return res.status(404).json({ message: `POC with ID ${mod_poc_id} or report not found` });
    }

    res.status(200).json({
      report: {
        title: poc.report.title || "",
        background: poc.report.background || "",
        address: poc.report.address || "",
        mod_id: poc.report.mod_id || "",
        mod_poc_id: poc.report.mod_poc_id || "",
        schedule: poc.report.schedule || "",
        totalStrength: poc.report.totalStrength || "",
        executiondates: poc.report.executiondates || "",
        scopeOfTheTraining: poc.report.scopeOfTheTraining || "",
        pointOfContact: poc.report.pointOfContact || {},
        expertDetails: poc.report.expertDetails || {},
        student_ranking: poc.report.student_ranking || [],
        summary: poc.report.summary || [],
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching report", error: error.message });
  }
});


// GET module by mod_id
router.get("/get-by-mod-id/:mod_id", async (req, res) => {
  const { mod_id } = req.params;
  const token = req.headers.authorization; // Get token from incoming request

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    // Fetch Express_Mod service details from Consul
    const result = await consul.catalog.service.nodes('Express_Mod');
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost'; // Fallback to localhost
    const servicePort = service.ServicePort;

    // Fetch module data from Express_Mod
    let response;
    try {
      response = await axios.get(`http://${serviceAddress}:${servicePort}/modules/get_module_by_id/${mod_id}`, {
        headers: { Authorization: token }, // Forward JWT token
      });
    } catch (error) {
      console.error(`Error fetching module by ID ${mod_id}:`, error.message);
      if (error.response) {
        // Handle specific HTTP errors from Express_Mod
        return res.status(error.response.status).json({
          error: `Failed to fetch module data: ${error.response.data.error || 'Unknown error'}`,
          details: error.message,
        });
      }
      return res.status(500).json({ error: "Failed to fetch module data", details: error.message });
    }

    if (!response.data) {
      return res.status(404).json({ error: `Module with ID ${mod_id} not found` });
    }

    res.json(response.data);
  } catch (err) {
    console.error("Error in get-by-mod-id:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});



// GET expert details using mod_poc_id
router.get("/get_expert_using_poc/:mod_poc_id", async (req, res) => {
  const { mod_poc_id } = req.params;
  const token = req.headers.authorization; // Get token from incoming request

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    const result = await consul.catalog.service.nodes('Express_Poc');
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost'; // Fallback to localhost
    const servicePort = service.ServicePort;

    let response;
    try {
      response = await axios.get(`http://${serviceAddress}:${servicePort}/expert/get_expert_poc_id/${mod_poc_id}`, {
        headers: { Authorization: token }, // Forward token
      });
    } catch (error) {
      console.error(`Error fetching expert by POC ID ${mod_poc_id}:`, error.message);
      return res.status(500).json({ error: "Failed to fetch expert data", details: error.message });
    }

    if (!response.data) {
      return res.status(404).json({ error: `Expert for POC ID ${mod_poc_id} not found` });
    }

    res.json(response.data);
  } catch (err) {
    console.error("Error fetching expert by POC ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

// GET test name by test_id
router.get("/get_test_name/:mod_tests", async (req, res) => {
  const { mod_tests } = req.params;
  const token = req.headers.authorization; // Get token from incoming request

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    const result = await consul.catalog.service.nodes('Express_Test');
    if (!result || result.length === 0) {
      return res.status(404).json({ error: "Express_Test service not found in Consul" });
    }

    const service = result[0];
    const serviceAddress = service.Address || 'localhost'; // Fallback to localhost
    const servicePort = service.ServicePort;

    let response;
    try {
      response = await axios.get(`http://${serviceAddress}:${servicePort}/test/get_by_test_id/${mod_tests}`, {
        headers: { Authorization: token }, // Forward token
      });
    } catch (error) {
      console.error(`Error fetching test by ID ${mod_tests}:`, error.message);
      return res.status(500).json({ error: "Failed to fetch test data", details: error.message });
    }

    const { test_name } = response.data;
    if (!test_name) {
      return res.status(404).json({ error: `Test with ID ${mod_tests} not found` });
    }

    res.json({ test_name });
  } catch (err) {
    console.error("Error fetching test by ID:", err.message);
    res.status(500).json({ error: "Unexpected error", details: err.message });
  }
});

router.get('/get_poc/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id });

    if (!poc) return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });

    res.status(200).json(poc);
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC", error: error.message });
  }
});

// GET POC NAME BY ID
router.get('/get_poc_name_by_id/:mod_poc_id', async (req, res) => {
  try {
    const poc = await Poc.findOne({ mod_poc_id: req.params.mod_poc_id }, { mod_poc_name: 1, _id: 0 });
    if (!poc) {
      return res.status(404).json({ message: `POC with ID ${req.params.mod_poc_id} not found` });
    }
    res.status(200).json({ mod_poc_name: poc.mod_poc_name });
  } catch (error) {
    res.status(500).json({ message: "Error fetching POC name", error: error.message });
  }
});

//////////////////////////////////////////


const formatExecutionDates = (start, end) => {
  const startDate = moment(start, "DD/MM/YYYY");
  const endDate = moment(end, "DD/MM/YYYY");

  const startDay = startDate.format("dddd DD/MM/YYYY");
  const endDay = endDate.format("dddd DD/MM/YYYY");

  return `${startDay} - ${endDay}`;
};
 // Assuming you have your Poc model

// PUT /generate_report/:mod_poc_id




// PUT route handler - corrected version
// PUT generate report
router.put('/generate_report/:mod_poc_id', async (req, res) => {
  const { mod_poc_id } = req.params;
  const { summary, title, background, address, scopeOfTheTraining, totalStrength, company, email, student_ranking } = req.body;
  const token = req.headers.authorization; // Get token from incoming request

  if (!token) {
    return res.status(401).json({ error: 'Access token is missing' });
  }

  try {
    // Fetch POC service info
    const pocService = await consul.catalog.service.nodes("Express_Poc");
    if (!pocService || pocService.length === 0) {
      return res.status(404).json({ error: "Express_Poc service not found in Consul" });
    }
    const serviceAddress = pocService[0].Address;
    const servicePort = pocService[0].ServicePort;

    // Get POC data
    const pocUrl = `http://${serviceAddress}:${servicePort}/poc/get_poc_by_poc_id/${mod_poc_id}`;
    let pocResponse, poc;
    try {
      pocResponse = await axios.get(pocUrl, {
        headers: { Authorization: token }, // Forward token
      });
      poc = pocResponse.data;
    } catch (error) {
      console.error("Error fetching POC data:", error.message);
      return res.status(500).json({ error: "Failed to fetch POC data", details: error.message });
    }

    if (!poc) {
      return res.status(404).json({ error: "POC not found" });
    }

    const { mod_id, mod_poc_name, mod_poc_role, mod_poc_email, mod_poc_mobile, mod_tests } = poc;

    // Get Module data
    const modService = await consul.catalog.service.nodes("Express_Mod");
    if (!modService || modService.length === 0) {
      return res.status(404).json({ error: "Express_Mod service not found in Consul" });
    }
    const modServiceAddress = modService[0].Address;
    const modServicePort = modService[0].ServicePort;

    const modUrl = `http://${modServiceAddress}:${modServicePort}/modules/get_module_by_id/${mod_id}`;
    let modResponse, modData;
    try {
      modResponse = await axios.get(modUrl, {
        headers: { Authorization: token }, // Forward token
      });
      modData = modResponse.data;
    } catch (error) {
      console.error("Error fetching Module data:", error.message);
      return res.status(500).json({ error: "Failed to fetch Module data", details: error.message });
    }

    // Format dates
    const [start, end] = modData.mod_duration.split(" - ");
    const executiondates = formatExecutionDates(start, end); // Assumes function exists
    const startDate = moment(start, "DD/MM/YYYY"); // Assumes moment is imported
    const endDate = moment(end, "DD/MM/YYYY");
    const durationDays = endDate.diff(startDate, "days") + 1;
    const schedule = `${durationDays} ${durationDays === 1 ? "day" : "days"}`;

    // Get Expert details
    const expertUrl = `http://${serviceAddress}:${servicePort}/poc/get_expert_using_poc/${mod_poc_id}`;
    let expertResponse, expertData;
    try {
      expertResponse = await axios.get(expertUrl, {
        headers: { Authorization: token }, // Forward token
      });
      expertData = expertResponse.data;
    } catch (error) {
      console.error("Error fetching Expert data:", error.message);
      return res.status(500).json({ error: "Failed to fetch Expert data", details: error.message });
    }

    const expertDetails = {
      name: expertData.mod_expert_name || "N/A",
      role: expertData.mod_expert_role || "N/A",
      company: company || expertData.mod_expert_company || "N/A",
      email: email || expertData.mod_expert_email || "N/A",
      contact: expertData.mod_expert_mobile || "N/A",
    };

    // Fetch test names from mod_tests
    let test_details = [];
    if (mod_tests && Object.keys(mod_tests).length > 0) {
      const testService = await consul.catalog.service.nodes("Express_Test");
      if (!testService || testService.length === 0) {
        console.warn("Express_Test service not found in Consul");
      } else {
        const testServiceAddress = testService[0].Address;
        const testServicePort = testService[0].ServicePort;
        const testIds = Object.values(mod_tests).map(test => test.test_id);

        for (const testId of testIds) {
          if (!testId) {
            console.warn(`Skipping invalid test ID:`, testId);
            continue;
          }
          try {
            const response = await axios.get(`http://${testServiceAddress}:${testServicePort}/test/get_by_test_id/${testId}`, {
              headers: { Authorization: token }, // Forward token
            });
            if (response.data && response.data.test_name) {
              test_details.push(response.data.test_name);
            }
          } catch (err) {
            console.error(`Failed to fetch test name for test ID ${testId}:`, err.message);
          }
        }
      }
    }
    console.log("Fetched Test Details:", test_details);

    // Create Point of Contact block
    const pointOfContact = {
      name: mod_poc_name || "N/A",
      role: mod_poc_role || "N/A",
      email: mod_poc_email || "N/A",
      contact: mod_poc_mobile || "N/A",
      test_details: [...test_details],
      summary: summary || [],
    };

    // Process update
    let updateFields = {};
    if (student_ranking) {
      const processedStudentRanking = Array.isArray(student_ranking) ? student_ranking : [student_ranking];
      updateFields['report.student_ranking'] = processedStudentRanking;
    }

    if (summary || title || background || address || scopeOfTheTraining || totalStrength || company || email) {
      updateFields['report.title'] = title;
      updateFields['report.background'] = background;
      updateFields['report.address'] = address;
      updateFields['report.mod_id'] = mod_id;
      updateFields['report.mod_poc_id'] = mod_poc_id;
      updateFields['report.schedule'] = schedule;
      updateFields['report.executiondates'] = executiondates;
      updateFields['report.scopeOfTheTraining'] = scopeOfTheTraining;
      updateFields['report.expertDetails'] = expertDetails;
      updateFields['report.pointOfContact'] = pointOfContact;
      updateFields['report.totalStrength'] = Number(totalStrength) || 0;
    }

    // Update database
    let updated;
    try {
      updated = await Poc.findOneAndUpdate(
        { mod_poc_id },
        { $set: updateFields },
        { new: true }
      );
      if (!updated) {
        return res.status(404).json({ error: "POC record not found for update" });
      }
    } catch (error) {
      console.error("Database update error:", error.message);
      return res.status(500).json({ error: "Failed to update database", details: error.message });
    }

    // Return result
    res.status(200).json({
      message: "Report generated successfully",
      reportData: {
        mod_id,
        pocDetails: {
          mod_poc_name,
          mod_poc_role,
          mod_poc_email,
          mod_poc_mobile,
        },
        moduleDetails: modData,
        expertDetails,
        updatedReport: updated.report,
        userCount: totalStrength || "N/A",
      },
    });
  } catch (err) {
    console.error("Error generating report:", err.message);
    console.error("Full error:", err);
    res.status(500).json({
      error: "Unexpected error",
      details: err.message,
    });
  }
});




// Add this new endpoint to your backend
router.get('/poc/report/:mod_poc_id', async (req, res) => {
  const { mod_poc_id } = req.params;

  try {
    // Reuse the same data fetching logic from your PUT endpoint
    // ... [fetch POC details, module details, expert details] ...

    // Return the data in the same structure as your PUT endpoint
    res.status(200).json({
      mod_id,
      pocDetails: {
        mod_poc_name,
        mod_poc_role,
        mod_poc_email,
        mod_poc_mobile
      },
      moduleDetails: modData,
      expertDetails,
      updatedReport: pocData.report, // Assuming report data is stored in the POC document
      userCount: mod_users.length
    });
  } catch (err) {
    console.error("Error fetching report data:", err.message);
    res.status(500).json({
      error: "Unexpected error",
      details: err.message
    });
  }
});

module.exports = router;