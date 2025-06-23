const express = require('express');
const MCQ = require('../models/MCQ');
const Consul = require("consul");
const consul = new Consul();
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Add multiple MCQs
router.post('/add_mcq', async (req, res) => {
    try {
        let mcqs = req.body; // Expecting an array of MCQs or a single object

        // Convert to an array if a single object is received
        if (!Array.isArray(mcqs)) {
            mcqs = [mcqs];
        }

        // Extract all questions to check for duplicates
        const mcqQuestions = mcqs.map(mcq => mcq.mcq_question);

        // Check if any of the questions already exist
        const existingMcqs = await MCQ.find({ mcq_question: { $in: mcqQuestions } });
        const existingQuestions = existingMcqs.map(mcq => mcq.mcq_question);

        // Filter out duplicates
        const newMcqs = mcqs.filter(mcq => !existingQuestions.includes(mcq.mcq_question));

        if (newMcqs.length === 0) {
            return res.status(400).json({ error: "All questions already exist. No new MCQs added." });
        }

        // Insert non-duplicate MCQs
        const savedMcqs = await MCQ.insertMany(newMcqs);

        res.status(201).json({
            message: `${savedMcqs.length} MCQ(s) added successfully`,
            mcqs: savedMcqs
        });

    } catch (error) {
        console.error("Error adding MCQs:", error);
        res.status(500).json({ error: error.message });
    }
});


// Get all MCQs
router.get('/get_all_mcqs', async (req, res) => {
    try {
        const mcqs = await MCQ.find({});
        res.status(200).json(mcqs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single MCQ by ID
router.get('/get_mcq/:mcq_id', async (req, res) => {
    try {
        const { mcq_id } = req.params;
        const mcq = await MCQ.findOne({ mcq_id });

        if (!mcq) {
            return res.status(404).json({ message: `No MCQ found with mcq_id: ${mcq_id}` });
        }

        res.status(200).json(mcq);
    } catch (error) {
        console.error("Error fetching MCQ:", error);
        res.status(500).json({ error: error.message });
    }
});


router.put("/update_mcq", async (req, res) => {
    const { mcq_id, ...updateData } = req.body;

    if (!mcq_id) {
        return res.status(400).json({ success: false, msg: "mcq_id is required" });
    }

    try {
        const mcq = await MCQ.findOne({ mcq_id });

        if (!mcq) {
            return res.status(404).json({ success: false, msg: "MCQ not found" });
        }

        // Update the MCQ fields
        Object.assign(mcq, updateData);
        await mcq.save();

        res.status(200).json({ success: true, msg: "MCQ updated successfully", mcq });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});


router.delete("/delete_mcq/:mcq_id", async (req, res) => {
    const { mcq_id } = req.params;

    if (!mcq_id) {
        return res.status(400).json({ success: false, msg: "mcq_id is required" });
    }

    try {
        const deletedMcq = await MCQ.findOneAndDelete({ mcq_id });

        if (!deletedMcq) {
            return res.status(404).json({ success: false, msg: "MCQ not found" });
        }

        res.status(200).json({ success: true, msg: "MCQ deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ success: false, msg: "Server Error", error: error.message });
    }
});


// Submit result to external service using consul

router.post("/submit_result", async (req, res) => {
    try {
      let {
        result_user_id,
        result_test_id,
        result_score,
        result_total_score,
        result_poc_id,
        result_id,
      } = req.body;
  
      // Generate unique result_id if not provided
      if (!result_id) {
        result_id = uuidv4();
        // console.log("🆕 Generated result_id:", result_id);
      }
  
      // Fetch service details from Consul
      const serviceName = "Express_Report";
      const services = await consul.catalog.service.nodes(serviceName);
      
    //   console.log("🔍 Retrieved services from Consul:", services);
  
      if (!services || services.length === 0) {
        // console.error("❌ No available service instances found in Consul");
        return res.status(500).json({ message: "No available service instances found in Consul" });
      }
  
      const { ServiceAddress, ServicePort } = services[0];
    //   console.log(`📡 Target Service: ${ServiceAddress}:${ServicePort}`);
  
      if (!ServiceAddress || !ServicePort) {
        // console.error("❌ Invalid service details from Consul:", services[0]);
        return res.status(500).json({ message: "Invalid service details from Consul" });
      }
  
      const targetUrl = `http://${ServiceAddress}:${ServicePort}/results/post-result`;
    //   console.log(`🚀 Sending request to: ${targetUrl}`);
  
      const response = await axios.post(targetUrl, {
        result_id,
        result_user_id,
        result_test_id,
        result_score,
        result_total_score,
        result_poc_id,
      });
  
      console.log("✅ Response from external service:", response.data);
  
      res.status(200).json({
        message: "✅ Result sent successfully to external service",
        response: response.data,
      });
  
    } catch (error) {
      console.error("❌ Error sending result to external service:", error.message);
  
      if (error.response) {
        console.error("⚠️ Response Data:", error.response.data);
        console.error("⚠️ Response Status:", error.response.status);
      }
  
      res.status(500).json({
        message: "Error sending result",
        error: error.message,
      });
    }
});
  


// GET /mcq/ids - Fetch only mcq_id values

router.get('/mcq/ids', async (req, res) => {
    try {
        const mcqIds = await MCQ.find({}, 'mcq_id'); // Fetch only mcq_id field
        res.status(200).json(mcqIds.map(mcq => mcq.mcq_id)); // Send as array of IDs
    } catch (error) {
        console.error("Error fetching MCQ IDs:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


router.post("/post_data_analytics", async (req, res) => {
  try {
    let {
      user_id,
      module_poc_name,
      module_poc_id,
      module_name,
      module_id,
      result_mcq_score,
      result_coding_score,
      result_test_id,
      date
    } = req.body;

    // Convert scores to numbers to avoid string issues
    result_mcq_score = Number(result_mcq_score);
    result_coding_score = Number(result_coding_score);

    const scored_mark = result_mcq_score + result_coding_score;
    const total_mark = 100;

    // 🧭 Find the service from Consul
    const serviceName = "Express_Report";
    const services = await consul.catalog.service.nodes(serviceName);

    if (!services || services.length === 0) {
      return res.status(500).json({ message: "No available service instances found in Consul" });
    }

    const { ServiceAddress, ServicePort } = services[0];

    if (!ServiceAddress || !ServicePort) {
      return res.status(500).json({ message: "Invalid service details from Consul" });
    }

    const targetUrl = `http://${ServiceAddress}:${ServicePort}/individual/post-individual`;

    // 🧨 THIS IS THE FIX: send FLAT body, not an array
    const payload = {
      user_id,
      module_poc_name,
      module_poc_id,
      module_name,
      module_id,
      result_test_id,
      date,
      result_mcq_score,
      result_coding_score,
      scored_mark,
      total_mark
    };

    const response = await axios.post(targetUrl, payload);

    res.status(200).json({
      message: "✅ Result sent successfully to Express_Report",
      response: response.data
    });

  } catch (error) {
    console.error("❌ Error sending result to Express_Report:", error.message);

    if (error.response) {
      console.error("⚠️ Response Data:", error.response.data);
      console.error("⚠️ Response Status:", error.response.status);
    }

    res.status(500).json({
      message: "Error sending result",
      error: error.message,
      details: error.response?.data || {}
    });
  }
});

// GET MCQ IDs by tag
// GET MCQ IDs by multiple tags
router.get("/get_mcqs_by_tags/:tags", async (req, res) => {
  try {
    const { tags } = req.params;

    if (!tags) {
      return res.status(400).json({ error: "Tags parameter is required" });
    }

    const tagsArray = tags.split(",").map(tag => tag.trim());

    const matchingMCQs = await MCQ.find(
      { mcq_tag: { $in: tagsArray } }, 
      "mcq_id"
    );

    res.status(200).json({
      count: matchingMCQs.length,
      mcq_ids: matchingMCQs.map(mcq => mcq.mcq_id),
    });
  } catch (error) {
    console.error("Error fetching MCQs by tags:", error);
    res.status(500).json({ error: error.message });
  }
});
  
  
  

module.exports = router;
