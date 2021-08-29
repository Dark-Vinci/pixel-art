/* 
    USER RELATED ROUTE HANDLERS 
*/

const express = require('express');
const bcrypt = require('bcrypt');

const router = express.Router();

const { User, validateUserChangePassword } = require('../model/user');

// impored middleware
const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

// arrya of middleware ofr route handlers
const idAdminMiddleware = [ idValidator, auth, admin ];
const adminMiddleware = [ auth, admin ];
const authBodyValidator = [ auth, bodyValidator(validateUserChangePassword) ];

// ? tested
// route handler for getting a user, just for the admin
router.get('/one/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .select({ password: 0 })
        .populate({ path: 'arts' });

    if (!user) {
        // no usch user with the id in the database
        return res.status(404).json({
            status: 404,
            message: 'user not found'
        });
    } else {
        // succes response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// ? working
// route handler to get the list of all users
router.get('/all-user', adminMiddleware, wrapper ( async ( req, res ) => {
    const users = await User.find()
        .select({ password: 0 });

    if (users.length == 0) {
        return res.status(404).json({
            status: 404,
            message: 'no user in the db yet'
        })
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: users
        });
    }
}));

// ? working 
// route handleer for user to get personal data
router.get('/me', auth, wrapper ( async ( req, res ) => {
    if (req.user.isAdmin) {
        // user is an admin, admin not allowed
        return res.status(400).json({
            status: 400,
            message: 'admin not allowed here'
        });
    } else {
        // the user is not an admin
        const id = req.user._id;
        const user = await User.findById(id)
            .select({ password: 0 })
            .populate({ path: 'arts' });

        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        })
    }
}));

// ? working pa
// route handler for changing users password
router.put('/change-password', authBodyValidator, wrapper ( async ( req, res ) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const { oldPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
        // wrong password was sent
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        // hashing of the new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        // modifying and saving the user password
        user.password = hash;
        await user.save();

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        })
    }
}));

// ? working like magic
// route handler for deleting a user, only for admins
router.delete('/remove/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id)
        .select({ password: 0 });

    if (!user) {
        // theres no such admin with the id in the db
        return res.status(404).json({
            status: 404,
            message: 'user not found'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

module.exports = router;