const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const testSchema = new mongoose.Schema({
    test_id: { type: String, default: uuidv4, unique: true },

    test_name: { type: String, required: true },
    test_language: { type: String, required: true },
    test_total_score: { type: Number, required: true },

    test_mcq_id: [{ type: String }],
    test_coding_id: [{ type: String }],

    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'disabled'
    },
    activeAt: { type: Date, default: null }
});

module.exports = mongoose.model('Test', testSchema);
