const mongoose = require('mongoose');
const { v4: uuidv4 } = require("uuid");

const expertSchema = new mongoose.Schema({
    mod_expert_id: { 
        type: String,
        default: uuidv4, 
        unique: true
    },
    poc_id: {
        type: [String], 
        default: []
    },
    mod_id: {
        type: [String],
        default: []
    },
    mod_expert_name: {
        type: String,
        required: true
    },
    mod_expert_mobile: {    
        type: String,
        required: true,
    },
    mod_expert_role: {
        type: String,
        required: true
    },
    mod_expert_profile: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('Expert', expertSchema);