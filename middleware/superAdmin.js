

module.exports = function (req, res, next) {
    if (!req.user.superAdmin) {
        // user is not an admin
        return res.status(403).json({
            status: 403,
            message: 'oga go kill you today'
        })
    } else {
        // the user is a superadmin
        next();
    }
}