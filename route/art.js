const express = require('express');

const router = express.Router();

const { Art, validateArt } = require('../model/drawing');
const { User } = require('../model/user');

const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const wrapper = require('../middleware/wrapper');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

// route handler middleware
const authArtMiddleware = [ auth, bodyValidator(validateArt) ];
const idAuthMiddleware = [ idValidator, auth ];
const adminMiddleware = [ auth, admin ];
const idAdminMiddleware = [ idValidator, auth, admin ];


// route handler for creating a new piece of art
router.post('/create', authArtMiddleware , wrapper ( async ( req, res ) => {
    const userId = req.user._id;
    const { pixel, name } = req.body;

    const art = new Art({ 
        name,
        pixel
    });

    await art.save();

    // ! to be used once more pushing the art id into the users arts array
    const user = await User.findById(userId);
    user.arts.push(art._id);
    await user.save();

    // success response
    res.status(200).json({
        status: 200,
        message: 'success',
        data: art
    });
}));

// ? working perfectly
// route handler for getting an artwork by the user
router.get('/my-art/:id', idAuthMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);

    const index = user.arts.indexOf(id);

    if (index < 0) {
        // the art isnt in the users arts array
        return res.status(404).json({
            status: 404,
            message: 'you do not have this art piece in your db'
        });
    } else {
        const art = await Art.findById(id);
        
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: art
        })
    }
}));

// ? working
// ! only for admin
// route handler for getting all the list of arts document
router.get('/all', adminMiddleware, wrapper ( async ( req, res ) => {
    const arts = await Art.find();

    if (arts.length == 0) {
        // there is no artworks yet in the db
        res.status(404).json({
            status: 404,
            message: 'there are no artwork yet in the db'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: arts
        });
    }
}));

router.get('/my-arts', auth, wrapper ( async ( req, res ) => {
    const userId = req.user._id;

    const user = await User.findById(userId)
        .populate({ 
            path: 'arts',
            select: { createdAt: 1, _id: 1, name: 1 }
        });

    const toReturn = user.arts;

    res.status(200).json({
        status: 200,
        message: 'success',
        data: toReturn
    });
}))

// ? working 
// ! for admin
// route handler for getting an artwork by its id
router.get('/by-id/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;
    const art = await Art.findById(id);

    if (!art) {
        // the arework cant be found in the database
        res.status(404).json({
            status: 404,
            message: 'there is no artwork with the id in db'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: art
        });
    }
}));

module.exports = router;