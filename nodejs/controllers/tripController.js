const Trip = require('../models/tripModel');
const City = require('../models/cityModel');
const User = require('../models/userModel');
// const redis = require('../database/redisConnection');
class TripController {
    async findIdByNumber(number) {
        try {
            const cachedTrip = await redis.get(`trip:${number}`);
    
            if (cachedTrip) {
                console.log('從 Redis 中取得行程id');
                return JSON.parse(cachedTrip);
            } 
            else {
                return null
            }
        } catch (error) {
            console.error('操作 Redis 時出錯 (trip) :', error);
            throw error
        }
    }

    async getTrip(tripNumber) {
        try{
            // const cachedTrip = await redis.get(`trip:${tripNumber}`);
            // if(cachedTrip){
                // const trip = JSON.parse(cachedTrip);
                // console.log('從 Redis 中取得行程資訊');
                // return trip
            // } 
            // else {
            const trip = await Trip.findOne({
                where: { number: tripNumber },
                attributes: { exclude: ['city_id', 'number'] }, 
                include: [
                    { 
                        model: City,
                        attributes: { exclude: ['id'] },
                        as: 'city',
                    },
                    {
                        model: User,
                        as: 'user'
                    }
                ]
            });
            // if(trip){
                // await redis.set(`trip:${tripNumber}`, JSON.stringify(trip), 'EX', 259200);
            return trip;
            // } 
            // else {
                // throw new Error('Trip not found');
            // }
            // }
        }
        catch (error) {
            console.error('Error retrieving trip:', error);
            throw error;
        }
    }

    async createTrip(cityId, date, city, userId, name){
        try{
            const tripData = {
                number: generateTripNumber(),
                city_id: cityId,
                start_date: date[0],
                end_date: date[1],
                user_id: userId,
                name: name
            }
            const newTrip = await Trip.create(tripData);
            // await redis.set(`trip:${newTrip.number}`, JSON.stringify({
            //     start_date: date[0],
            //     end_date: date[1],
            //     city: {
            //         name: city.name,
            //         country: city.country,
            //         lat: city.lat,
            //         lng: city.lng
            //     }
            // }), 'EX', 259200);
            return newTrip.number;
        }
        catch(error){
            console.error('Error creating trip:', error);
            throw error;
        }
    }

    async getTripsByUserId(userId){
        try {
            const trips = await Trip.findAll({
                where: {user_id: userId},
                attributes: { exclude: ['id', 'trip_id', 'user_id', 'city_id'] }, 
                include:  { 
                    model: City,
                    attributes: { exclude: ['id', 'google_id', 'lat', 'lng'] },
                    as: 'city',
                },
                raw: true
            });
            return trips;
        } catch (error) {
            throw error;
        }
    }

    async getPublicTrips(){
        try {
            const publicTrips = await Trip.findAll({
                attributes: { exclude: ['id', 'trip_id', 'user_id', 'city_id'] }, 
                include: [
                    { 
                        model: City,
                        attributes: { exclude: ['id', 'google_id', 'lat', 'lng'] },
                        as: 'city',
                    },
                    {
                        model: User,
                        attributes: { exclude: ['id'] },
                        as: 'user'
                    }
                ],
                raw: true
            }); 
            return publicTrips;
        } catch (error) {
            throw error
        }
    }

    async checkNewTrip(newTrip){
        try{
            if(!newTrip || !newTrip.city || !newTrip.date[0] || !newTrip.date[1] ){
                throw new Error('Bad Request. Please provide valid data.');
            }
        }
        catch(error){
            console.error('Error checking trip data:', error);
            throw error;
        }
    }

    // async mapToTripData(newTripJSON){
    //     try{
    //         // 檢查必要的資料是否存在
    //         if (!newTripJSON || !newTripJSON.date[0] || !newTripJSON.date[1] || !newTripJSON.city) {
    //             throw new Error('Bad Request. Please provide valid data.');
    //         }
    //         const tripData = {
    //             city_id: newTripJSON.city,
    //             number: generateTripNumber(),
    //             start_date: newTripJSON.date[0],
    //             end_date: newTripJSON.date[1]
    //         }
    //         return tripData;
    //     }
    //     catch(error){
    //         console.error('Error mapping to trip data:', error);
    //         throw error;
    //     }
    // }
}

const tripController = new TripController();

module.exports = tripController;

function generateTripNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${year}${month}${day}${randomSuffix}`;
}