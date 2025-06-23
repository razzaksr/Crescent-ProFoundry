const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const TestCase = require("../models/TestCase");


// ✅ Create TestCase
router.post("/create_testCase", async (req, res) => {
  try {
    const { testcase_input, testcase_output, testcase_tags } = req.body;

    if (!testcase_input || !testcase_output) {
      return res.status(400).json({ error: "Input and output fields are required" });
    }

    const newTestCase = new TestCase({
      testcase_id: uuidv4(),
      testcase_input,
      testcase_output,
      testcase_tags,
    });

    await newTestCase.save();
    res.status(201).json(newTestCase);
  } catch (error) {
    console.error("Error creating test case:", error);
    res.status(500).json({ error: error.message });
  }
});


// ✅ Get All TestCases
router.get("/get_all_testCases", async (req, res) => {
  try {
    const testCases = await TestCase.find();
    res.json(testCases);
  } catch (error) {
    console.error("Error fetching test cases:", error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get TestCase by ID (FIXED)
router.get("/get_testCase_id/:id", async (req, res) => {
  try {
    const testCase = await TestCase.findOne({ testcase_id: req.params.id });

    if (!testCase) {
      return res.status(404).json({ message: "TestCase not found" });
    }

    res.status(200).json(testCase);
  } catch (error) {
    console.error("Error fetching test case:", error);
    res.status(500).json({ error: error.message });
  }
});


router.put('/update_testCase', async (req, res) => {
  try {
      const { testcase_id, ...updateData } = req.body;

      if (!testcase_id) {
          return res.status(400).json({ success: false, msg: "testcase_id is required" });
      }

      // Find the test case by ID
      const testCase = await TestCase.findOne({ testcase_id });
      if (!testCase) {
          return res.status(404).json({ success: false, msg: "TestCase not found" });
      }

      // Update the existing fields with new values
      Object.assign(testCase, updateData);

      // Save the updated test case
      await testCase.save();

      res.status(200).json({ success: true, msg: "TestCase updated successfully", testCase });
  } catch (error) {
      console.error("Update Error:", error);
      res.status(500).json({ success: false, msg: "Server Error", error: error.message });
  }
});



// ✅ Delete TestCase (FIXED)
router.delete("/delete_testCase/:id", async (req, res) => {
  try {
    const deletedTestCase = await TestCase.findOneAndDelete({ testcase_id: req.params.id });

    if (!deletedTestCase) {
      return res.status(404).json({ message: "TestCase not found" });
    }

    res.json({ message: "TestCase deleted successfully" });
  } catch (error) {
    console.error("Error deleting test case:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


// Route: Get test case IDs by tag
router.get("/get_testcases_by_tag/:tag", async (req, res) => {
  try {
    const { tag } = req.params;

    if (!tag) {
      return res.status(400).json({ error: "Tag is required" });
    }

    const matchingTestCases = await TestCase.find({ testcase_tags: tag }, "testcase_id");

    res.status(200).json({
      count: matchingTestCases.length,
      testcase_ids: matchingTestCases.map(tc => tc.testcase_id),
    });
  } catch (error) {
    console.error("Error fetching test cases by tag:", error);
    res.status(500).json({ error: error.message });
  }
});

