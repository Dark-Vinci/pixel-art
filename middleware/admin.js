// MIDDLEWARE TO AUTHORIZE USER

module.exports = function (req, res, next) {
    if (!req.user.isAdmin) {
        // the user is not an admin
        return res.status(403).json({
            status: 403,
            message: 'youre not allowed here'
        });
    } else {
        // the user is an admin, request is passed
        // to the next middleware function;
        next();
    }
}