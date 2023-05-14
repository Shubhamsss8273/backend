// To check if the user is admin user:

const checkAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ login: true, error: 'You are not authorized to perform this action' });
    }
    next();
}

module.exports = checkAdmin;