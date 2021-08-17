const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const router = express.Router();

const { User, validateUserLogin } = require('../model/user');
const wrapper = require('../middleware/wrapper');
const bodyValidator = require('../middleware/bodyValidator');

router.post('/', bodyValidator(validateUserLogin), wrapper ( async ( req, res ) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({
            status: 404,
            message: 'invalid email or password'
        });
    } else {
        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return res.status(404).json({
                status: 404,
                message: 'invalid email or password'
            });
        } else {
            const token = user.generateAuthToken();
            const toReturn = _.pick(user, [ 'username', '_id', 'email' ]);
            res.status(200).header('x-auth-token', token)
                .json({
                    status: 200,
                    message: 'success',
                    data: toReturn
                });
        }
    }
}));


module.exports = router;