const mongoose = require('mongoose');
const { Schema } = mongoose;

const notebookSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    notes: [
        {
            title: {
                type: String,
                required: true,
                trim: true
            },
            tags: {
                type: String,
                trim: true
            },
            description: {
                type: String,
                required: true,
                trim: true
            },
            createdOn: {
                type: Date,
                default: Date.now
            }
        }
    ],
    createdOn: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('notebook', notebookSchema);