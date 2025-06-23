const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CodeSchema = new mongoose.Schema(
  {
    code_id: {
      type: String,
      default: () => uuidv4(), // ✅ Ensures a new UUID is generated for each document
      unique: true,
    },
    code_problem_statement: {
      type: String,
      required: true,
      unique: true, // Ensures unique problem statements
    },
    code_test_cases_id: [{ type: String }], // Can be duplicate
    code_tags: [{ type: String }], // Can be duplicate
  },
  { timestamps: true }
);

module.exports = mongoose.model("Code", CodeSchema);
