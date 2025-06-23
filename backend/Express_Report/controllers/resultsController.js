const express = require("express");
const router = express.Router();
const Result = require("../models/results");
const { v4: uuidv4 } = require("uuid");
const consul = require('../middleware/consul');
const axios = require("axios");


// **GET - Fetch All Results**
router.get("/get-result", async (req, res) => {
  try {
    const results = await Result.find();
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
});

// **POST - Add a New Result**

router.post("/post-result", async (req, res) => {
  try {
    const { result_user_id, result_test_id, result_score, result_total_score, result_poc_id } = req.body;

    // Validate required fields
    if (!result_user_id || !result_test_id || result_score == null || result_total_score == null || !result_poc_id) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check for duplicate entry
    const existingResult = await Result.findOne({
      result_user_id,
      result_test_id
    });

    if (existingResult) {
      return res.status(409).json({ message: "Result already exists for this user and test" });
    }

    // Generate UUID for result_id
    const result_id = uuidv4();

    // Store in database
    const newResult = new Result({
      result_id,
      result_user_id,
      result_test_id,
      result_score,
      result_total_score,
      result_poc_id,
    });

    await newResult.save();

    res.status(201).json({ message: "Result stored successfully", result: newResult });
  } catch (error) {
    console.error("Error saving result:", error.message);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});
// BULK RESULT POST

router.post("/post-bulk-results", async (req, res) => {
  try {
    const results = req.body; // Expecting an array of result objects

    // Validate input
    if (!Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array of results" });
    }

    // Validate each result object and add result_id
    const validatedResults = results.map((result) => {
      const { result_user_id, result_test_id, result_score, result_total_score, result_poc_id } = result;

      if (!result_user_id || !result_test_id || result_score == null || result_total_score == null || !result_poc_id) {
        throw new Error(`Missing required fields in result: ${JSON.stringify(result)}`);
      }

      return {
        result_id: uuidv4(),
        result_user_id,
        result_test_id,
        result_score,
        result_total_score,
        result_poc_id,
      };
    });

    // Insert all results into the database
    const savedResults = await Result.insertMany(validatedResults);

    res.status(201).json({
      message: " Bulk results stored successfully",
      count: savedResults.length,
      results: savedResults,
    });
  } catch (error) {
    console.error(" Error saving bulk results:", error.message);
    res.status(400).json({ message: "Error processing bulk results", error: error.message });
  }
});





//  PUT - Update an existing result
router.put("/update-result", async (req, res) => {
  try {
    const { result_id, ...updateData } = req.body;

    if (!result_id) {
      return res.status(400).json({ message: "result_id is required for update" });
    }

    const updatedResult = await Result.findOneAndUpdate(
      { result_id },
      updateData,
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: " Result updated successfully", result: updatedResult });
  } catch (error) {
    res.status(500).json({ message: "Error updating result", error });
  }
});



// **DELETE - Remove a Result**
router.delete("/delete-by-result-id/:result_id", async (req, res) => {
  try { 
    const { result_id } = req.params;

    const deletedResult = await Result.findOneAndDelete({ result_id });

    if (!deletedResult) {
      return res.status(404).json({ message: "Result not found" });
    }

    res.json({ message: " Result deleted successfully", result: deletedResult });
  } catch (error) {
    res.status(500).json({ message: "Error deleting result", error });
  }
});


// **GET - Fetch Result Scores by result_user_id**
router.get("/get-result-by-user/:result_user_id", async (req, res) => {
  try {
    const { result_user_id } = req.params;

    // Fetch all results for the user with full data
    const results = await Result.find({ result_user_id });

    if (results.length === 0) {
      return res.status(404).json({ message: "No results found for this user" });
    }

    // Return just the raw result documents
    res.json(results);

  } catch (error) {
    res.status(500).json({ message: "Error fetching results", error });
  }
});


router.get('/results/check', async (req, res) => {
  try {
    const { user_id, test_id } = req.query;

    // Query your database to see if the result already exists
    const existingResult = await Result.findOne({
      result_user_id: user_id,
      result_test_id: test_id,
    });

    res.json({ exists: !!existingResult }); // true or false
  } catch (err) {
    console.error("Error checking for existing result:", err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET - Fetch Results by result_user_id and result_test_id
router.get("/get_result_by_user_id_test_id", async (req, res) => {
  const { result_user_id, result_test_id } = req.query;

  // Validate query parameters
  if (!result_user_id || !result_test_id) {
    return res.status(400).json({
      message: "Missing required query parameters: result_user_id and result_test_id",
    });
  }

  try {
    const results = await Result.find({
      result_user_id,
      result_test_id,
    });

    res.status(200).json(results); // Return the results (array)
  } catch (error) {
    console.error("Error fetching results:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET route to fetch results by user ID
router.get('/get_results_by_user_id/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Find all results for the specified user ID
    const results = await Result.find({ result_user_id: userId });

    // If no results found
    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No results found for user ID: ${userId}`
      });
    }

    // Return successful response with results
    res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    // Handle any errors
    console.error('Error fetching results:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching results',
      error: error.message
    });
  }
});

// GET PERCENTAGE TILL DATE 

async function getServiceAddress(serviceName) {
  try {
    const services = await consul.catalog.service.nodes(serviceName);
    if (!services || services.length === 0) {
      console.error(` No available service instances found for ${serviceName}`);
      throw new Error(`No available service instances found for ${serviceName}`);
    }
    const { ServiceAddress, ServicePort } = services[0];
    if (!ServiceAddress || !ServicePort) {
      console.error(` Invalid service details for ${serviceName}:`, services[0]);
      throw new Error(`Invalid service details for ${serviceName}`);
    }
    return `http://${ServiceAddress}:${ServicePort}`;
  } catch (error) {
    console.error(` Error fetching service ${serviceName}:`, error.message);
    throw error;
  }
}

router.get('/aggregate_scores/:poc_id/:user_id', async (req, res) => {
  try {
    const { poc_id, user_id } = req.params;
    console.log(` Processing aggregate_scores for poc_id: ${poc_id}, user_id: ${user_id}`);

    // Fetch Express_Poc service address
    const pocGatewayUrl = await getServiceAddress('Express_Poc');
    console.log(` Express_Poc URL: ${pocGatewayUrl}`);

    const testsResponse = await axios.get(`${pocGatewayUrl}/poc/tests_till_today/${poc_id}`);
    const testIds = testsResponse.data.tests_till_today.map(test => test.test_id);
    console.log(` Fetched ${testIds.length} test IDs:`, testIds);

    if (!testIds.length) {
      console.log(` No tests found for poc_id: ${poc_id}`);
      return res.status(200).json({
        message: ' No tests found for this POC',
        response: { tests: [], total_result_score: 0, total_test_score: 0, average_percentage: 0 }
      });
    }

    // Fetch Express_Test service address
    const testGatewayUrl = await getServiceAddress('Express_Test');
    console.log(` Express_Test URL: ${testGatewayUrl}`);

    // Fetch Express_Report'); service address (self)
    const resultGatewayUrl = await getServiceAddress('Express_Report');

    const results = await Promise.all(
      testIds.map(async (test_id) => {
        let test_total_score = 0;
        try {
          const testResponse = await axios.get(`${testGatewayUrl}/test/get_by_test_id/${test_id}`);
          test_total_score = testResponse.data.test_total_score || 0;
        } catch (error) {
          console.error(` Error fetching test ${test_id}:`, error.message);
          if (error.response) {
            console.error(` Response Data:`, error.response.data);
            console.error(` Response Status:`, error.response.status);
          }
          test_total_score = 0;
        }

        let result_score = 0;
        try {
          const resultResponse = await axios.get(
            `${resultGatewayUrl}/results/get_result_by_user_id_test_id?result_user_id=${user_id}&result_test_id=${test_id}`
          );
          result_score = resultResponse.data[0]?.result_score || 0;
        } catch (error) {
          console.log(` No result found for test_id ${test_id}, user_id ${user_id}`);
          if (error.response) {
            console.error(` Error fetching result for test ${test_id}:`, error.response.data);
            console.error(` Response Status:`, error.response.status);
          }
          result_score = 0;
        }

        const percentage = test_total_score > 0 ? (result_score / test_total_score) * 100 : 0;

        return { test_id, test_total_score, result_score, percentage };
      })
    );

    const total_result_score = results.reduce((sum, r) => sum + r.result_score, 0);
    const total_test_score = results.reduce((sum, r) => sum + r.test_total_score, 0);
    const average_percentage = total_test_score > 0 ? (total_result_score / total_test_score) * 100 : 0;

    res.status(200).json({
      message: ' Scores aggregated successfully',
      response: { tests: results, total_result_score, total_test_score, average_percentage }
    });
  } catch (error) {
    console.error(' Error in aggregate_scores:', error.message);
    if (error.response) {
      console.error(' Response Data:', error.response.data);
      console.error(' Response Status:', error.response.status);
    }
    res.status(500).json({ message: 'Error aggregating scores', error: error.message });
  }
});

module.exports = router;