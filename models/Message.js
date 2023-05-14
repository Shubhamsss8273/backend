const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    name : {
        type: String,
        require: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        trim: true
    },
    message: {
        type: String,
        require: true,
        trim: true
    },
    date:{
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Message', messageSchema);