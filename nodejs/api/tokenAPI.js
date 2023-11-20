const express = require('express');
const tokenAPI = express.Router();

const dotenv = require('dotenv');
dotenv.config();
const mapboxToken = process.env.MAPBOX_TOKEN;
const googleMapToken = process.env.GOOGLE_MAP_TOKEN;

tokenAPI.get('/api/t/b', async (req, res) => {
    res.status(200).json(mapboxToken);
})

tokenAPI.get('/api/t/g', async (req, res) => {
    res.status(200).json(googleMapToken);
})

module.exports = tokenAPI;