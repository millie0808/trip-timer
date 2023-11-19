const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.json());
app.set('views', path.join(__dirname, 'views/static'));
app.set('view engine', 'ejs');
const staticFolderPath = path.join(__dirname, 'views/static');
const customStaticPath = '/';
app.use(customStaticPath, express.static(staticFolderPath));

app.get('/', (req, res) => {
    res.render('templates/index')
})
app.get('/trip/new', (req, res) => {
    res.render('templates/new_trip')
})
app.get('/trip/site', (req, res) => {
    res.render('templates/add_site')
})

const cityAPI = require('./api/cityAPI');
const tripAPI = require('./api/tripAPI');
const siteAPI = require('./api/siteAPI');
const tokenAPI = require('./api/tokenAPI');
app.use('/', cityAPI);
app.use('/', tripAPI);
app.use('/', siteAPI);
app.use('/', tokenAPI);

// path not exited
app.get('*', (req, res) => {
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`應用程序運行在 http://localhost:${port}`);
});