const express = require('express');
const path = require('path');
const session = require('express-session');
const dotenv = require('dotenv');
dotenv.config()

const app = express();
const port = 3000;
app.use(express.json());
app.set('views', path.join(__dirname, 'views/static'));
app.set('view engine', 'ejs');
const faviconPath = path.join(__dirname, 'favicon.ico');
app.use('/favicon.ico', express.static(faviconPath));
const staticFolderPath = path.join(__dirname, 'views/static');
const customStaticPath = '/';
app.use(customStaticPath, express.static(staticFolderPath));
app.use(session({secret: process.env.SESSION_SECRET_KEY, resave: false, saveUninitialized: false}));


app.get('/', (req, res) => {
    res.render('templates/index')
})
app.get('/trip/new', (req, res) => {
    res.render('templates/new_trip')
})
app.get('/trip/:tripNumber', (req, res) => {
    res.render('templates/trip')
})
app.get('/member', (req, res) => {
    res.render('templates/member')
})
app.get('/community', (req, res) => {
    res.render('templates/community')
})

const cityAPI = require('./api/cityAPI');
const tripAPI = require('./api/tripAPI');
const scheduleAPI = require('./api/scheduleAPI');
const userAPI = require('./api/userAPI');
app.use('/', cityAPI);
app.use('/', tripAPI);
app.use('/', scheduleAPI);
app.use('/', userAPI);

// path not exited
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`應用程序運行在 http://localhost:${port}`);
});