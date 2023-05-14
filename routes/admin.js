const router = require('express').Router();
const checkUser = require('../middlewares/checkUser');
const checkAdmin = require('../middlewares/checkAdmin');
const User = require('../models/User');
const Notebook = require('../models/Notebook');


// <-----------------------------------------Notebook routes---------------------------------------------------------->

// To view all notebooks of a user using GET: /api/admin/fetchnotebook/:userId
router.get('/fetchnotebook/:userId', checkUser, checkAdmin, async (req, res) => {
    try {

        const notebooks = await Notebook.find({ user: req.params.userId });
        res.status(200).json({ status: 'Success', notebooks: notebooks, error: null })

    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });
    }
})

// To create a notebook for a user using POST: /api/admin/addnotebook/:userId
router.post('/addnotebook/:userId', checkUser, checkAdmin, async (req, res) => {
    try {
        const newNotebook = new Notebook({
            user: req.params.userId,
            title: req.body.title
        })
        const notebook = await newNotebook.save();
        res.status(201).json({ status: 'Success', notebook: notebook, error: null })
    } catch (error) {
        res.status(500).json({ status: 'Error', notebook: null, error: 'Internal server error' });

    }
})

// <------------------------------------------------------------User Routes-------------------------------------------->

//To get the registered user list using GET: api/admin/fetchusers
router.get('/fetchusers', checkUser, checkAdmin, async (req, res) => {
    try {
        const users = await User.find({ isAdmin: false }).select({ password: 0, __v: 0 });
        if (!users) { return res.status(404).json({ error: "You don't have any registered users.", users: null }) }
        const totalNotebooks = await Notebook.countDocuments();
        res.status(200).json({ error: null, users: users, totalNotebooks: totalNotebooks })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', users: null })
    }
})

// To delete a user using DELETE: api/admin/deleteuser/:userId
router.delete('/deleteuser/:userId', checkUser, checkAdmin, async (req, res) => {
    try {
        const user = User.findById(req.params.userId)
        if (!user) { return res.status(404).json({ status: 'Error', user: null, error: 'The requested user was not found.' }) }
        const result = await User.findByIdAndDelete(req.params.userId);
        await Notebook.deleteMany({ user: req.params.userId })
        const totalNotebooks = await Notebook.countDocuments();
        res.status(200).json({ totalNotebooks: totalNotebooks, user: result, error: null })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', users: null })
    }
})

// To update an user using PUT: api/admin/updateuser/:userId
router.put('/updateuser/:userId', checkUser, checkAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) { return res.status(404).json({ status: 'Error', user: null, error: 'The requested user was not found' }) }
        const { firstName, lastName, gender, adminKey } = req.body;
        let isAdmin = false
        if (adminKey) {
            process.env.ADMIN_KEY === adminKey ? isAdmin = true : isAdmin = false
        }
        const updatedUser = await User.findByIdAndUpdate(req.params.userId, { firstName, lastName, gender, isAdmin }, { new: true, select: { password: 0, __v: 0 } })
        res.status(201).json({ status: 'Success', user: updatedUser, error: null })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', users: null })
    }
})

// To get online code compiler  api keys using GET: api/admin/fetchkeys
router.get('/fetchkeys', async (req, res) => {
    try {
        res.status(200).json({ apiHost: process.env.RAPID_API_HOST, apiKey: process.env.RAPID_API_KEY, error: null })
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', apiHost: null, apiKey: null })
    }
})


module.exports = router;