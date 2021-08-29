const express = require('express');

const router = express.Router();

const { Home, validateHome } = require('../model/home');
const { Art } = require('../model/drawing');

const wrapper = require('../middleware/wrapper');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const idValidator = require('../middleware/idValidator');
const bodyValidator = require('../middleware/bodyValidator');

const adminBodyMiddleware = [ auth, admin, bodyValidator(validateHome) ];
const adminMiddleware = [ auth, admin ];
const idAdminMiddleware = [ idValidator, auth, admin ];

// ? all working
// main home route handler for the app
router.get('/', wrapper ( async ( req, res ) => {
    const home = await Home.findOne({ isPublished: true })
        .sort({ createdAt: -1 })
        .populate({ path: 'artId' })
        .limit(1);
    
    if (!home) {
        res.send('welcome to the home page')
    } else {
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        })
    }
}));

// ? works
// route handler for getting collection of hime documents
router.get('/all', adminMiddleware, wrapper ( async ( req, res ) => {
    const homes = await Home.find()
        .sort({ createdAt: -1 });

    if (homes.length == 0) {
        // theres no home document yet in the database
        return res.status(404).json({
            status: 200,
            message: 'no home document for now'
        })
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: homes
        })
    }
}));

// ? working
// route handler for  getting the collection of published home document
router.get('/published', adminMiddleware, wrapper ( async ( req, res ) => {
    const homes = await Home.find({ isPublished: true })
        .sort({ createdAt: -1 });

    if (homes.length == 0) {
        // theres no home document yet in the database
        return res.status(404).json({
            status: 200,
            message: 'no home document for now'
        })
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: homes
        })
    }
}));

// ? working
// route handler for  getting the collection of non published home document
router.get('/not-published', adminMiddleware, wrapper ( async ( req, res ) => {
    const homes = await Home.find({ isPublished: false })
        .sort({ createdAt: -1 });

    if (homes.length == 0) {
        // theres no home document yet in the database
        return res.status(404).json({
            status: 200,
            message: 'no home document for now'
        })
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: homes
        })
    }
}));

// ? working more than magic
// route handler fir creating an home document
router.post('/create', adminBodyMiddleware, wrapper ( async ( req, res ) => {
    const { title, description1, description2, artId } = req.body;

    // check if art is in art collection
    const art = await Art.findById(artId);

    if (!art) {
        // the artId isnt mapped to any art in the db;
        return res.status(404).json({
            status: 404,
            message: 'theres is no art in the db with the artId supplied'
        });
    } else {
        const home = new Home ({
            title,
            description1,
            description2,
            artId
        });
    
        await home.save();
    
        res.status(201).json({
            status: 201,
            message: 'success',
            data: home
        });
    }
}));

// ? working pa
// route handler for publishing a home document
router.put('/publish/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    // finding the and updating the home documnet
    const home = await Home.findOneAndUpdate({ _id: id }, {
        $set: { isPublished: true }
    }, { new: true });

    if (!home) {
        // home document is not found
        return res.status(404).json({
            status: 404,
            message: 'home document not found'
        });
    } else {
        // success response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: 'updated'
        })
    }
}));

// ? working
// route handler for editing a home documnent
router.put('/edit/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const home = await Home.findById(id);

    if (!home) {
        return res.status(404).json({
            status: 404,
            message: 'home document is not found'
        });
    } else {
        if (home.isPublished) {
            return res.status(404).json({
                status: 404,
                message: 'cant modify a published document'
            })
        } else {
            const { title, description1, description2, art } = req.body;
            home.set({
                title: title || home.title,
                description1: description1 || home.description1,
                description2: description2 || home.description2,
                art: art || home.art
            });
    
            await home.save();
    
            res.status(201).json({
                status: 201,
                message: 'success',
                data: 'updated'
            });
        }
    }
}));

// ? working
// route handler for deleting a home document
router.delete('/delete/:id', idAdminMiddleware, wrapper ( async ( req, res ) => {
    const { id } = req.params;

    const home = await Home.findByIdAndRemove(id);

    if (!home) {
        // home documnet not found
        return res.status(404).json({
            status: 404,
            message: 'the home document with the id is not in the database'
        })
    } else {
        // document deleted response
        res.status(200).json({
            status: 200,
            message: 'success',
            data: home
        });
    }
}));

module.exports = router;