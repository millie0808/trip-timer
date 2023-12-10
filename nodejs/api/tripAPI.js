const express = require('express');
const tripAPI = express.Router();

const cityController = require('../controllers/cityController');
const tripController = require('../controllers/tripController');
const scheduleController = require('../controllers/scheduleController');

// Create new trip
tripAPI.post('/api/trip', async (req, res) => {
    try{
        const newTrip = req.body;
        await tripController.checkNewTrip(newTrip);
        const cityId = await cityController.findId(newTrip.city);
        const tripNumber = await tripController.createTrip(cityId, newTrip.date, newTrip.city, newTrip.userId, newTrip.name);
        res.status(201).json({
            ok: true,
            trip: {
                number: tripNumber
            }
        });
    }
    catch(error){
        console.error('Error creating trip:', error);
        // 錯誤的回應
        if(error.message === 'Bad Request. Please provide valid data.'){
            res.status(400).json({
                error: error.message
            });
        }
        else{
            res.status(500).json({
                error: 'Internal Server Error'
            });
        }
    }
})


tripAPI.get('/api/trip/', async (req, res) => {
    try{
        const tripNumber = req.query.number;
        const trip = await tripController.getTrip(tripNumber);
        const schedule = await scheduleController.getSchedule(trip);
        res.status(200).json({
            ok: true,
            trip: trip,
            schedule: schedule
        });
    }
    catch(error){
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

tripAPI.get('/api/trips', async (req, res) => {
    try{
        const userId = req.query.userId;
        if(userId){
            const trips = await tripController.getTripsByUserId(userId);
            res.status(200).json({
                ok: true,
                trips: trips
            });
        } else {
            const publicTrips = await tripController.getPublicTrips();
            res.status(200).json({
                ok: true,
                trips: publicTrips
            });
        }
    }
    catch(error){
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

module.exports = tripAPI;