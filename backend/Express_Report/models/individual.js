const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const getTodayDate = () => new Date().toISOString().split("T")[0];

const testSchema = new mongoose.Schema({
  result_test_id: { type: String },
  date: { type: String, default: getTodayDate },
  result_mcq_score: { type: String, default: "0" },
  result_coding_score: { type: String, default: "0" },
  scored_mark: { type: String, default: "0" },
  total_mark: { type: String, default: "100" }
}, { _id: false });

const individualSchema = new mongoose.Schema({
  report_id: { type: String, default: uuidv4 },
  module_name: { type: String },
  module_id: { type: String },
  module_poc_name: { type: String },
  module_poc_id: { type: String },
  user_id: { type: String, required: true, unique: true },
  tests: [testSchema]
});

const Individual = mongoose.model("individual", individualSchema);
module.exports = Individual;