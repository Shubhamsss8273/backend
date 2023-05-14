const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const passport = require('passport');
require('../middlewares/passport.js');
const checkUser = require('../middlewares/checkUser.js');



//Route1: To create a new user using POST: /api/auth/register, Login not required:
router.post('/register', async (req, res) => {

    try {
        const { firstName, lastName, email, password, gender } = req.body;
        //To check if a user already exists:
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ login: false, user: null, error: 'User with this email already exists' })
        };

        //To hash the password:
        const salt = await bcrypt.genSalt(15);
        const hashPassword = await bcrypt.hash(password, salt);
        user = new User({
            firstName: firstName.toLowerCase(),
            lastName: lastName.toLowerCase(),
            email: email.toLowerCase(),
            password: hashPassword,
            gender: gender
        });

        const savedUser = await user.save();

        // To login a user automatically after signing up:
        req.login(savedUser, (err) => {
            req.session.login = true;
            res.status(201).json({ login: req.session.login, user: savedUser, error: null });
        })

    } catch (error) {
        res.status(500).json({ login: null, user: null, error: 'Internal Server Error' });
    }
})


//Route2: To login a user using POST: /api/auth/login, Login not required:
router.post('/login', passport.authenticate('local', { failureRedirect: '/api/auth/loginfail', successRedirect: '/api/auth/loginsuccess' }))

// Login fail route handler
router.get('/loginfail', (req, res) => {
    req.session.login = false
    res.status(400).json({ login: req.session.login, user: null, error: 'Invalid Credentials' });
});

// Login success route handler
router.get('/loginsuccess', (req, res) => {
    req.session.login = true;
    res.status(200).json({ login: req.session.login, user: req.user, error: null });
});


//Route2: To logout a user using get: /api/auth/logout, Login required:
router.get('/logout', checkUser, (req, res) => {
    try {
        req.logOut(err => {
            req.session.login = false
            res.status(200).json({ login: req.session.login, user: null, error: null });
        });

    } catch (error) {
        res.status(500).json({ login: req.session.login, user: req.user, error: 'Internal Server Error' });
    }
})

// To get the session info on first start of app:
router.get('/user', (req, res) => {
    try {
        res.status(200).json({ login: req.session.login, user: req.user, error: null });
    } catch (error) {
        res.status(500).json({ login: req.session.login, user: req.user, error: 'Internal Server Error' });
    }
})

// To change the password using PUT: /api/auth/updatepassword, Login required
router.put('/updatepassword', checkUser, async (req, res) => {
    try {

        const user = await User.findById(req.user.id, 'password');
        const isValid = await bcrypt.compare(req.body.password, user.password);

        if (!isValid) {
            return res.status(401).json({ login: req.session.login, user: req.user, error: 'Invalid Password' })
        }

        const salt = await bcrypt.genSalt(15);
        const newPasswordHash = await bcrypt.hash(req.body.newPassword, salt);
        const result = await User.findByIdAndUpdate(req.user.id, { password: newPasswordHash });
        res.status(201).json({ login: req.session.login, user: req.user, error: null })

    } catch (error) {
        res.status(500).json({ login: req.session.login, user: req.user, error: 'Internal Server Error' });
    }
})

// To update the user profile using PUT: /api/auth/updateuser, Login required
router.put('/updateuser', checkUser, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ login: req.session.login, user: req.user, error: 'User not found' })
        }
        const { firstName, lastName, gender, adminKey } = req.body;
        let isAdmin = false
        if (adminKey) {
            adminKey === process.env.ADMIN_KEY ? isAdmin = true : isAdmin = false
        }
        const result = await User.findByIdAndUpdate(req.user.id, { firstName, lastName, gender, isAdmin }, { new: true, select: { password: 0, __v: 0 } });
        res.status(201).json({ login: req.session.login, user: result, error: null })
    } catch (error) {
        res.status(500).json({ login: req.session.login, user: req.user, error: 'Internal Server Error' });
    }
})


module.exports = router;