const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const { v4: uuidv4 } = require('uuid');

// Create Test
router.post('/create', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    let { test_name, test_language, test_mcq_id, test_coding_id, test_total_score, status, test_id } = req.body;

    // Generate test_id if not provided
    if (!test_id) {
      test_id = uuidv4();
    }

    // Validate required fields
    if (!test_name || !test_language || !test_total_score) {
      return res.status(400).json({ error: 'Missing required fields: test_name, test_language, test_total_score' });
    }
    if (!Array.isArray(test_mcq_id) || !Array.isArray(test_coding_id)) {
      return res.status(400).json({ error: 'test_mcq_id and test_coding_id must be arrays' });
    }
    if (!['active', 'disabled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status: must be "active" or "disabled"' });
    }

    const newTest = new Test({
      test_id,
      test_name,
      test_language,
      test_mcq_id,
      test_coding_id,
      test_total_score,
      status,
    });
    await newTest.save();
    res.status(201).json({ message: 'Test created successfully', test: newTest });
  } catch (error) {
    console.error('Error creating test:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Test ID already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});


// Get All Tests
router.get('/all', async (req, res) => {
    try {
        const tests = await Test.find();
        res.status(200).json(tests);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get only active tests (auto-disable after 24 hrs)
router.get('/active', async (req, res) => {
    try {
        const now = new Date();
        const activeTests = await Test.find({ status: 'active', activeAt: { $ne: null } });

        const validTests = [];
        const expiredTests = [];

        for (const test of activeTests) {
            const timeDiff = now - new Date(test.activeAt);
            const hoursPassed = timeDiff / (1000 * 60 * 60);

            if (hoursPassed <= 24) {
                validTests.push(test);
            } else {
                // Auto-disable expired tests
                test.status = 'disabled';
                test.activeAt = null;
                await test.save();
                expiredTests.push(test.test_id);
            }
        }

        res.status(200).json({ active_tests: validTests, auto_disabled: expiredTests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read Single Test by test_id
router.get('/get_by_test_id/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        const test = await Test.findOne({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Test (replace mcq and coding ids with only valid provided ones)
router.put('/update', async (req, res) => {
    try {
        const { test_id, mcq_id, coding_test_id, ...updateData } = req.body;

        // Validate test_id
        if (!test_id) {
            return res.status(400).json({ success: false, msg: "test_id is required" });
        }

        // Find the test
        const test = await Test.findOne({ test_id });
        if (!test) {
            return res.status(404).json({ success: false, msg: "Test not found" });
        }

        // Prepare update operations
        const updateOperations = { $set: { ...updateData } };

        // Set MCQ IDs
        if (mcq_id !== undefined) {
            const newMcqIds = Array.isArray(mcq_id)
                ? [...new Set(mcq_id.filter(id => id && typeof id === 'string' && id.trim() !== ''))]
                : (mcq_id && typeof mcq_id === 'string' && mcq_id.trim() !== '') ? [mcq_id] : [];
            updateOperations.$set.test_mcq_id = newMcqIds;
        }

        // Set Coding Test IDs
        if (coding_test_id !== undefined) {
            const newCodingIds = Array.isArray(coding_test_id)
                ? [...new Set(coding_test_id.filter(id => id && typeof id === 'string' && id.trim() !== ''))]
                : (coding_test_id && typeof coding_test_id === 'string' && coding_test_id.trim() !== '') ? [coding_test_id] : [];
            updateOperations.$set.test_coding_id = newCodingIds;
        }

        // Validate if there are any updates to perform
        if (Object.keys(updateOperations.$set).length === 0) {
            return res.status(400).json({ success: false, msg: "No valid update data provided" });
        }

        // Perform the update
        const updatedTest = await Test.findOneAndUpdate(
            { test_id },
            updateOperations,
            { new: true, runValidators: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ success: false, msg: "Failed to update test" });
        }

        res.status(200).json({
            success: true,
            msg: "Test updated successfully",
            test: updatedTest
        });
    } catch (error) {
        console.error("Update Error:", error);
        res.status(500).json({
            success: false,
            msg: "Server Error",
            error: error.message
        });
    }
});


// Toggle Test Status (active/disabled)
router.put('/toggle_status', async (req, res) => {
    try {
        const { test_id, status } = req.body;

        if (!test_id || !['active', 'disabled'].includes(status)) {
            return res.status(400).json({ message: 'test_id and valid status (active or disabled) are required' });
        }

        const updatedTest = await Test.findOneAndUpdate(
            { test_id },
            {
                $set: {
                    status,
                    activeAt: status === 'active' ? new Date() : null
                }
            },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: 'Test not found' });
        }

        res.status(200).json({ message: `Test status set to '${status}'`, test: updatedTest });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Test
router.delete('/delete/:test_id', async (req, res) => {
    try {
        const { test_id } = req.params;
        const test = await Test.findOneAndDelete({ test_id });
        if (!test) return res.status(404).json({ message: 'Test not found' });
        res.status(200).json({ message: 'Test deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove MCQ from Test
router.put('/remove_mcq_from_test', async (req, res) => {
    try {
        const { test_id, mcq_id } = req.body;

        if (!test_id || !mcq_id) {
            return res.status(400).json({ error: "test_id and mcq_id are required" });
        }

        const updatedTest = await Test.findOneAndUpdate(
            { test_id },
            { $pull: { test_mcq_id: mcq_id } },
            { new: true }
        );

        if (!updatedTest) {
            return res.status(404).json({ message: "Test not found" });
        }

        res.status(200).json({ message: "MCQ removed successfully", test: updatedTest });
    } catch (error) {
        console.error("Error removing MCQ:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
