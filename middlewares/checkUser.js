// The middleware for checking if a user is logged in. if not then send access denied

const checkUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        return res.status(401).json({ login: false, error: 'Access Denied' });
    }
}

module.exports = checkUser;