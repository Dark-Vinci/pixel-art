const express = require('express');

const router = express.Router();

const { User, validateUserChangePassword } = require('../model/user');
const { Art, validateArt } = require('../model/drawing');

const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

const idAdminMiddleware = [ idValidator, auth, admin ];
const adminMiddleware = [ auth, admin ];
const authBodyValidator = [ auth, bodyValidator(validateUserChangePassword) ];
const authArtMiddleware = [ auth, bodyValidator(validateArt) ];
const idAuthMiddleware = [ idValidator, auth ];

// only admin
router.get('/one/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const user = await User.findById(id)
        .select({ password: 0 })
        .populate({ path: 'arts' });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'user not found'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

// route handler to get the list of all users
router.get('/all-user', adminMiddleware, wrapper ( async ( req, res ) => {
    const users = await User.find()
        .select({ password: 0 });

    res.status(200).json({
        status: 200,
        message: 'success',
        data: users
    });
}));

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

// route handler for creating the art
router.post('/create-art', authArtMiddleware, wrapper ( async ( req, res ) => {
    const userId = req.user._id;
    const { dimension, shape, size, pixel } = req.body;

    const art = new Art({
        dimension,
        shape,
        size, 
        pixel
    });

    await art.save();

    const user = await UserfindById(userId);
    user.arts.push(art._id);
    await user.save();

    res.status(200).json({
        status: 200,
        message: 'success',
        data: art
    });
}));

// route handler for editing an art piece
router.post('/edit-art/:id', wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const index = user.arts.indexOf(id);

    if (index < 0) {
        return res.status(404).json({
            status: 404,
            message: 'you do not have this art piece in your db'
        });
    } else {
        const { shape, size, pixel } = req.body;

        const art = await Art.findById(id);
        art.set({
            shape: shape || art.shape,
            size: size || art.size,
            pixel: pixel || art.pixel
        });
        await art.save()

        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'your artwork has been edited'
        })
    }
}));

// route handler for getting a single art by user
router.get('/get-art/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const index = user.arts.indexOf(id);

    if (index < 0) {
        return res.status(404).json({
            status: 404,
            message: 'you do not have this art piece in your db'
        });
    } else {
        const art = await Art.findById(id);
        
        res.status(200).json({
            status: 200,
            message: 'success',
            data: art
        })
    }
}));

// route handler for changing users password
router.put('/change-password', authBodyValidator, wrapper ( async ( req, res ) => {
    const userId = req.user._id;
    const user = await User.findById(userId);

    const { oldPassword, newPassword } = req.body;
    const isValid = await bcrypt.compare(oldPassword, user.password);

    if (!isValid) {
        return res.status(400).json({
            status: 400,
            message: 'invalid inputs'
        });
    } else {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        user.password = hash;
        await user.save();

        res.status(200).json({
            status: 200,
            message: 'success',
            data: `your new password is now ${ newPassword }`
        })
    }
}))

// route handler for deleting a user, only for admins
router.delete('/remove/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const user = await User.findByIdAndRemove(id)
        .select({ password: 0 });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'user not found'
        });
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: user
        });
    }
}));

module.exports = router;