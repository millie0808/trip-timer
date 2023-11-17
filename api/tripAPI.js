const express = require('express');
const tripAPI = express.Router();

const tripController = require('../controllers/tripController');

// Create new trip
tripAPI.post('/api/trip', async (req, res) => {
    try{
        const newTripJSON = req.body;
        const newTripData = await tripController.mapToTripData(newTripJSON);
        const newTrip = await tripController.createTrip(newTripData);
        // 成功的回應
        res.status(201).json({
            ok: true,
            id: newTrip.id
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

module.exports = tripAPI;