// database for the app

const mongoose = require('mongoose');
const winston = require('winston');

module.exports = function () {
    mongoose.connect('mongodb://localhost/arts', {
        useFindAndModify: false,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    })
        .then(() => winston.info('connected to mongodb '))
}