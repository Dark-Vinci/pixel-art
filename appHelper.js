// helper function to app.js to have a more smart app.js file

module.exports = function (app) {
    require('./startup/logger')();
    require('./startup/config')();
    require('./startup/db')()
    require('./startup/route')(app);
}