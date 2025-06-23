const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Define Mongoose Schema
const resultSchema = new mongoose.Schema({
  result_id: { type: String, required: true, unique: true, default: uuidv4 },
  result_user_id: { type: String, required: true },
  result_test_id: { type: String, required: true },
  result_score: { type: Number, required: true }, // Score obtained by the user
  result_total_score: { type: Number, required: true }, // Total possible score
  result_poc_id: { type: String, required: true },
  created_at: { type: Date, default: Date.now }, // Timestamp for result submission
});

// Create Mongoose Model
const Result = mongoose.model("Result", resultSchema);

module.exports = Result; // Exporting the model for reuse