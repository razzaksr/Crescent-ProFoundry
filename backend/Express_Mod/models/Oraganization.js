const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const OrganizationSchema = new mongoose.Schema({
  org_id: { type: String, default: uuidv4, unique: true },
  org_name: { type: String, required: true },
  org_address: { type: String, required: true },
  org_email: { type: String, required: true, unique: true },
  org_contact: { type: String, required: true },
  org_associated_date: { type: String},
  mod_id: [{ type: String }] 
});

module.exports = mongoose.model("Organization", OrganizationSchema);
