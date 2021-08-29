/* 
FILE THAT CONTAINS ADMIN RELATED ACTION AND HANDLERS, STRICTLY FOR AN ADMIN
 */

const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { 
    Admin, validateAdmin, validateAdminLogin,
    validateAdminChangePassword
} = require('../model/admin');

// middleware imports
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');
const idValidator = require('../middleware/idValidator');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const superAdmin = require('../middleware/admin');

// array of middleware for route handlers
const adminMiddleware = [ auth, admin ];
const idSuperAdminMiddleware = [ idValidator, auth, admin, superAdmin ];
const idAdminMiddleware = [ idValidator, auth, admin ];
const adminBodyMiddleware = [ 
    auth, admin, bodyValidator(validateAdminChangePassword) 
];

// ! tested
// route handler for getting all admin in the db 
router.get('/all-admin', adminMiddleware, wrapper ( async ( req, res ) => {
    const admins = await Admin.find()
        .select({ password: 0 });

        if (admin.length == 0) {
            return res.status(404).json({
                status: 404,
                message: 'no admin in the db yet'
            });
        } else {
            res.status(200).json({
                status: 200,
                message: 'success',
                data: admins
            });
        }
}));

// ! tested
// route handler for getting an admin by its id
router.get('/by-id/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const admin = await Admin.findById(id)
        .select({ password: 0 });

    if (!admin) {
        //  admin is not in the database
        return res.status(404).json({
            status: 404,
            message: 'admin not found in the db'
        });
    } else {
        // succes response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: admin
        })
    }
}));

// ! tested
// route handler for registering an admin
router.post('/register', bodyValidator(validateAdmin), wrapper ( async ( req, res ) => {
    const adminCount = await Admin.find().count();
    if (adminCount >= 3) {
        // admin shouldnt be more than 3
        return res.status(400).json({
            status: 400,
            message: 'we cant have more than 3 admins'
        });
    } else {
        const { username, email, password } = req.body;

        let admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(400).json({
                status: 400,
                message: 'an admin exist with same email'
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const hashed = await bcrypt.hash(password, salt);
    
            admin = new Admin ({
                username,
                email,
                password: hashed,
                superAdmin: adminCount == 0 ? true : false
            });
        
            await admin.save();
            const token = admin.generateAuthToken();
            const toReturn = _.pick(admin, ['username', '_id', 'email', 'superAdmin']);
        
            // success response
            res.status(201).header('x-auth-token', token)
                .json({
                    status: 201,
                    message: 'success',
                    data: toReturn
                })
        }
    }
}));

// ! tested
// route handler for logging in an admin
router.post('/login', bodyValidator(validateAdminLogin), wrapper ( async ( req, res ) => {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
        // theres no admin with the email
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        const isValid = await bcrypt.compare(password, admin.password);

        if (!isValid) {
            // invalid password
            return res.status(404).json({
                status: 404,
                message: 'invalid email or password'
            });
        } else {
            const token = admin.generateAuthToken();
            const toReturn = _.pick(admin, [ 'username', '_id', 'email', 'superAdmin' ]);
            res.status(200).header('x-auth-token', token)
                .json({
                    status: 200,
                    message: 'success',
                    data: toReturn
                });
        }
    }
}));

// ! tested
// route handler for changing the password of an admin by the admin
router.put('/change-password', adminBodyMiddleware, wrapper ( async ( req, res ) => {
    const adminId = req.user._id;
    const admin = await Admin.findById(adminId);

    const { oldPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(oldPassword, admin.password);

    if (!isValid) {
        // not a the admin password
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        // hashing of the new password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        admin.password = hash;
        await admin.save();

        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        })
    }
}));

// ! tested
// only for superadmins
router.delete('/remove-admin/:id', idSuperAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const admin = await Admin.findByIdAndRemove(id);

    if (!admin) {
        // theres no such admin in the db
        return res.status(404).json({
            status: 404,
            data: 'admin not found'
        });
    } else {
        // the id has been deleted
        res.status(200).json({
            status: 200,
            message: 'success',
            data: `${ admin.username } has been deleted successfully`
        });
    }
}));

module.exports = router;