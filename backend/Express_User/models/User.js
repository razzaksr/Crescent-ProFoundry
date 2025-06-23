const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const userSchema = new mongoose.Schema({
    user_id: {
        type: String,
        default: uuidv4,
        unique: true
    },
    full_name: {
        type: String,
        required: true
    },
    department: {
        type: String,
    },
    college: {
        type: String,
    },
    rollno: {
        type: String,
        default: null
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile_no: {
        type: String,
        default: null 
    },
    status: {
        type: Boolean,        
        default: true,
    },
    admin: {
        type: Boolean,       
        default: false,
    },
    user_last_login: {
        type: Date
    }
});

// Create partial index for unique rollno only when it's not null
userSchema.index({ rollno: 1 }, { unique: true, partialFilterExpression: { rollno: { $type: 'string' } } });

const User = mongoose.model('User', userSchema);
module.exports = User;