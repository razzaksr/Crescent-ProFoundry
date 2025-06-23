const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ModuleSchema = new mongoose.Schema({
  mod_id: { type: String, default: uuidv4, unique: true },
  mod_name: { type: String, required: true },
  mod_tech: { type: String, required: true },
  mod_duration: { type: String, required: true }
});

const Module = mongoose.model("Module", ModuleSchema);

module.exports = Module;
