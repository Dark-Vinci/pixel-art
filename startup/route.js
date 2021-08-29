// handles all type of route and high level middleware

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

const register = require('../route/register');
const login = require('../route/login');
const user = require('../route/user');
const admin = require('../route/admin');
const art = require('../route/art');
const home = require('../route/home');
const error = require('../middleware/error');

const corsOptions = {
    exposedHeaders: 'x-auth-token'
}

module.exports = function (app) {
    app.use(cors(corsOptions))
    app.use(helmet());

    if (app.get('env') == 'development') {
        app.use(morgan('tiny'));
    }
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api/register', register);
    app.use('/api/login', login);
    app.use('/api/admin', admin);
    app.use('/api/user', user);
    app.use('/api/art', art);
    app.use('/api/home', home);

    app.use(error);
}