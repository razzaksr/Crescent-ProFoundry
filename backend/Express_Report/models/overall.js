const mongoose = require("mongoose");

const overallSchema = new mongoose.Schema({
  report_id: String,
  report_mod: String,
  report_poc: String,
  student_name: String,
  student_id: String,
  total_marks: Number,
  scored_marks: Number,
  percentage: {
    type: Number,
    default: function () {
      return this.scored_marks && this.total_marks
        ? (this.scored_marks / this.total_marks) * 100
        : 0;
    },
  },
});

const Overall = mongoose.model("Overall", overallSchema);
module.exports = Overall;