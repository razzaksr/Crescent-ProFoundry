const express = require("express");
const router = express.Router();
const Module = require("../models/Module");

// Create Module
router.post("/add_module", async (req, res) => {
  try {
    const module = new Module(req.body);
    await module.save();
    res.status(201).json(module);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

  // Get All Modules
  router.get("/get_all_module", async (req, res) => {
    try {
      const modules = await Module.find();
      res.json(modules);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Get Module by ID
router.get("/get_module_by_id/:id", async (req, res) => {
  try {
    const module = await Module.findOne({ mod_id: req.params.id });
    if (!module) return res.status(404).json({ message: "Not Found" });
    res.json(module);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE MODULE (No Params, Uses Request Body)
router.put("/update_module", async (req, res) => {
  try {
    const { mod_id, ...updateFields } = req.body;

    if (!mod_id) {
      return res.status(400).json({ error: "mod_id is required" });
    }

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ error: "At least one field to update is required" });
    }

    const updatedModule = await Module.findOneAndUpdate(
      { mod_id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedModule) {
      return res.status(404).json({ error: "Module not found" });
    }

    res.json(updatedModule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Delete Module
router.delete("/delete_module/:id", async (req, res) => {
  try {
    const module = await Module.findOneAndDelete({ mod_id: req.params.id });

    if (!module) {
      return res.status(404).json({ message: "Module not found for deletion." });
    }

    res.json({ message: "Module deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Module name by mod_ID
router.get("/get_module_name_by_id/:id", async (req, res) => {
  try {
    const module = await Module.findOne({ mod_id: req.params.id });
    if (!module) return res.status(404).json({ message: "Not Found" });
    res.json({mod_name: module.mod_name});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get All Modules
router.get("/get_all_module_name", async (req, res) => {
  try {
    const modules = await Module.find();
    res.json(modules.map(mod => ({
      mod_id: mod.mod_id,
      mod_name: mod.mod_name
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
