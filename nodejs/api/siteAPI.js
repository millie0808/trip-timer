const express = require('express');
const siteAPI = express.Router();

const siteController = require('../controllers/siteController');

siteAPI.get('/api/sites', async (req, res) => {
    const cityId = req.query.cityId;
    if (!cityId) {
        return res.status(400).json({ error: 'CityId is required' });
    }
    const sites = await siteController.getSitesByCityId(cityId);
    res.status(200).json(sites);
})

module.exports = siteAPI;