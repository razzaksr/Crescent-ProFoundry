const express = require("express");
const Overall = require("../models/overall"); // Updated model name

const router = express.Router();

// 📌 Add Student Performance Data
router.post("/post-overall", async (req, res) => {
    try {
        const { report_id, report_mod, report_poc, student_name, student_id, total_marks, scored_marks } = req.body;
        const percentage = total_marks ? ((scored_marks / total_marks) * 100).toFixed(2) : 0; // Calculate percentage safely

        const newPerformance = new Overall({ 
            report_id, 
            report_mod, 
            report_poc, 
            student_name, 
            student_id, 
            total_marks, 
            scored_marks, 
            percentage 
        });

        await newPerformance.save();
        res.status(201).json(newPerformance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 📌 Update Student Performance Data
router.put("/update-overall", async (req, res) => {
    try {
        const { student_id, scored_marks, total_marks, report_id, report_mod, report_poc, student_name } = req.body;
        if (!student_id) return res.status(400).json({ error: "Student ID is required" });

        const percentage = total_marks ? ((scored_marks / total_marks) * 100).toFixed(2) : 0; // Recalculate percentage safely

        const updatedPerformance = await Overall.findOneAndUpdate(
            { student_id },
            { $set: { report_id, report_mod, report_poc, student_name, scored_marks, total_marks, percentage } },
            { new: true }
        );

        if (!updatedPerformance) return res.status(404).json({ error: "Performance data not found for this student" });
        res.json(updatedPerformance);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 📌 Get All Student Performance Data
router.get("/get-all-overall", async (req, res) => {
    try {
        const data = await Overall.find();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Get Total Marks by Module
router.get("/total-marks/:module", async (req, res) => {
    try {
      const { module } = req.params;
      const record = await Overall.findOne({ report_mod: module });

      if (!record) {
        return res.status(404).json({ error: "Module not found" });
      }

      res.json({ total_marks: record.total_marks });
    } catch (error) {
      console.error("Error fetching total marks:", error);
      res.status(500).json({ error: "Server error" });
    }
});

// 📌 Get Performance by Student ID
router.get("/:student_id", async (req, res) => {
    try {
        const studentPerformance = await Overall.find({ student_id: req.params.student_id });
        if (studentPerformance.length === 0) {
            return res.status(404).json({ error: "No performance data found for this student" });
        }
        res.json(studentPerformance);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 📌 Delete Student Performance Data
router.delete("/delete-overall-by-stu-id/:student_id", async (req, res) => {
    try {
        const deletedPerformance = await Overall.findOneAndDelete({ student_id: req.params.student_id });

        if (!deletedPerformance) {
            return res.status(404).json({ error: "Performance data not found for this student" });
        }

        res.json({ message: "Performance data deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
