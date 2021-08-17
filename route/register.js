const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { User, validateUser } = require('../model/user');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

router.post('/', bodyValidator(validateUser), wrapper ( async ( req, res ) => {
    const { username, email, password } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    const user = new User ({
        username,
        email,
        password: hashed
    });

    await user.save();
    const token = user.generateAuthToken();
    const toReturn = _.pick(user, ['username', '_id', 'email']);

    res.status(201).header('x-auth-token', token)
        .json({
            status: 201,
            message: 'success',
            data: toReturn
        })
}));


module.exports = router