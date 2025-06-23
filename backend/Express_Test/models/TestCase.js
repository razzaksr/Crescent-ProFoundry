const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const TestCaseSchema = new mongoose.Schema(
  {
    testcase_id: { type: String, default: uuidv4, unique: true },
    testcase_input: [{ type: String }],
    testcase_output: [{ type: String }],
    testcase_tags: [{ type: String }]
  },
  { timestamps: true } // Adds createdAt & updatedAt fields
);
module.exports = mongoose.model("TestCase", TestCaseSchema);
