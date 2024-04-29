const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const supportSchema = new mongoose.Schema({
    Nom: {
        type: String,
        required: true
    },
    Prénom: {
        type: String,
        required: true
    },
    Email: {
        type: String,
        required: true
    },
    Status: {
        type: String,
        default: 'Open'
    },
    Priority: {
        type: String,
        default: 'Low'
    },
    chat: [chatSchema] 
});

module.exports = mongoose.model('Support', supportSchema);
