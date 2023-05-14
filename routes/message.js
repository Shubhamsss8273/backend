const Message = require('../models/Message');
const express = require('express');
const router = express.Router();
const checkUser = require('../middlewares/checkUser');
const checkAdmin = require('../middlewares/checkAdmin');

// To store the messages:
router.post('/', async (req, res) => {
    try {
        const message = new Message({
            name: req.body.name.toLowerCase(),
            email: req.body.email.toLowerCase(),
            message: req.body.message.toLowerCase(),
        });
        const savedMessage = await message.save();
        res.status(201).json({ message: savedMessage, error: null });
    } catch (error) {
        res.status(500).json({ message: null, error: 'Internal Server Error' });
    }
})

//To fetch all messages using GET: /api/message/fetchmessages
router.get('/fetchmessages', checkUser, checkAdmin, async (req, res) => {

    try {
        const messages = await Message.find();
        res.status(200).json({ message: messages, error: null })
    } catch (error) {
        res.status(500).json({ message: null, error: 'Internal Server Error' });
    }
})

//To delete message using DELETE: /api/message/deletemessage/:messageId
router.delete('/deletemessage/:messageId', checkUser, checkAdmin, async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);
        if (!message) { return res.status(404).json({ message: null, error: 'The requested message was not found' }) }
        const result = await Message.findByIdAndDelete(req.params.messageId)
        res.status(200).json({ message: result, error: null })
    } catch (error) {
        res.status(500).json({ message: null, error: 'Internal Server Error' });
    }
})

module.exports = router;