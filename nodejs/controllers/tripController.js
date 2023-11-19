const Trip = require('../models/tripModel');
const cityController = require('./cityController');

class TripController {
    async getAllTrips() {
        try {
            const trips = await Trip.findAll();
            return trips;
        } 
        catch (error) {
            console.error('Error retrieving trips:', error);
            throw error;
        }
    }

    async createTrip(tripData){
        try{
            const newTrip = await Trip.create(tripData);
            return newTrip;
        }
        catch(error){
            console.error('Error creating trip:', error);
            throw error;
        }
    }

    async mapToTripData(newTripJSON){
        try{
            // 檢查必要的資料是否存在
            if (!newTripJSON || !newTripJSON.date[0] || !newTripJSON.date[1] || !newTripJSON.city) {
                throw new Error('Bad Request. Please provide valid data.');
            }
            const cityId = await cityController.mapToCityId(newTripJSON.city);
            const tripData = {
                city_id: cityId,
                start_date: newTripJSON.date[0],
                end_date: newTripJSON.date[1]
            }
            return tripData;
        }
        catch(error){
            console.error('Error mapping to trip data:', error);
            throw error;
        }
    }
}

const tripController = new TripController();

module.exports = tripController;
