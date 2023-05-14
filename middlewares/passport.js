const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');


//To use email as username:
const customFields = {
    usernameField: 'email',
    passwordField: 'password'
}

// Callback fn for passport strategy
const verifyCallback = async (username, password, done) => {
    try {
        const user = await User.findOne({ email: username })
        if (!user) { return done(null, false) }
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) { return done(null, false) }
        else { return done(null, user) };
    }
    catch {
        done(error);
    }
}

// Create a new local strategy instance
const strategy = new LocalStrategy(customFields, verifyCallback);
// Use the new strategy instance in passport
passport.use(strategy);

//passport does this behind the scene to add user into session.

// serializeUser stores the user id in express session.
passport.serializeUser((user, done) => {
    done(null, user.id)
});

// deserializeUser takes the userId from express session and fetches the user from db and add it to req object (req.user)
passport.deserializeUser((userId, done) => {
    User.findById(userId, '-password')
        .then((user) => {
            done(null, user);
        })
        .catch((err) => {
            done(err);
        })
});