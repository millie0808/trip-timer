const express = require('express');
const cityAPI = express.Router();

const cityController = require('../controllers/cityController');

// 獲取全部城市
cityAPI.get('/api/cities', async (req, res) => {
    try{
        const cities = await cityController.getAllCities();
        res.status(200).json(cities);
    }
    catch(error){
        console.error('Error retrieving cities:', error);
        // 錯誤的回應
        if(error.message === 'No cities found.'){
            res.status(404).json({
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

module.exports = cityAPI;