const express = require('express');
const scheduleAPI = express.Router();

const siteController = require('../controllers/siteController');
const scheduleController = require('../controllers/scheduleController');

// Create new
scheduleAPI.post('/api/schedule', async (req, res) => {
    try{
        const body = req.body;
        const siteIds = await siteController.handleSite(body.schedule);
        scheduleController.createSchedule(siteIds, body.schedule, body.duration, body.trip_id);
        res.status(201).json({
            ok: true
        });
    }
    catch(error){
        console.error('Error creating trip:', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

scheduleAPI.put('/api/schedule', async (req, res) => {
    try{
        const body = req.body;
        const siteIds = await siteController.handleSite(body.schedule);
        scheduleController.deleteSchedule(body.trip_id);
        scheduleController.createSchedule(siteIds, body.schedule, body.duration, body.trip_id);
        res.status(201).json({
            ok: true
        });
    }
    catch(error){
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

module.exports = scheduleAPI;