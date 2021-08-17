const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const register = require('./route/register');
const login = require('./route/login');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

if (app.get('env') == 'development') {
    app.use(morgan('tiny'));
}

app.use('/api/register', register);
app.use('/api/login', login);

app.get('/', (req, res) => {
    res.send('welcome to the art app');
});

const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`listening at port ${ port }`));