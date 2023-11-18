const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
app.use(express.json());

const staticFolderPath = path.join(__dirname, 'views/static');
const customStaticPath = '/';
app.use(customStaticPath, express.static(staticFolderPath));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})
app.get('/trip/new', (req, res) => {
    res.sendFile(__dirname + '/views/new_trip.html')
})
app.get('/trip/site', (req, res) => {
    res.sendFile(__dirname + '/views/add_site.html')
})

const cityAPI = require('./api/cityAPI');
const tripAPI = require('./api/tripAPI');
const siteAPI = require('./api/siteAPI');
const tokenAPI = require('./api/tokenAPI');
app.use('/', cityAPI);
app.use('/', tripAPI);
app.use('/', siteAPI);
app.use('/', tokenAPI);

app.listen(port, () => {
    console.log(`應用程序運行在 http://localhost:${port}`);
});