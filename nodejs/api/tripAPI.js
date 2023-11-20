const express = require('express');
const tripAPI = express.Router();

const tripController = require('../controllers/tripController');
const scheduleController = require('../controllers/scheduleController');

// Create new trip
tripAPI.post('/api/trip', async (req, res) => {
    try{
        const newTripJSON = req.body;
        const newTripData = await tripController.mapToTripData(newTripJSON);
        const newTrip = await tripController.createTrip(newTripData);
        const newScheduleDataList = await scheduleController.mapToScheduleData(newTripJSON, newTrip.id);
        await scheduleController.createSchedule(newScheduleDataList);
        // 成功的回應
        res.status(201).json({
            ok: true,
            trip: newTrip
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
        res.status(200).json({
            ok: true,
            trip: trip
        });
    }
    catch(error){
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
})

module.exports = tripAPI;