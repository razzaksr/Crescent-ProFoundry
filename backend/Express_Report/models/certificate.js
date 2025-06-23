const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  certificate_id: String,
  certificate_user_id: String,
  certificate_mod_id: String,
  certificate_poc_id: String,
  certificate_generated_date: String,
  certificate_url: String,
});

const StudentCertificate = mongoose.model("StudentCertificate", studentSchema);

module.exports = StudentCertificate;