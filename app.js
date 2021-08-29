const express = require('express');
const winston = require('winston');

const app = express();
require('./appHelper')(app);

const port = process.env.PORT || 3030;
app.listen(port, () => winston.info(`listening at port ${ port }`));