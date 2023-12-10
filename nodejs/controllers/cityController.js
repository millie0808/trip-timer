const City = require('../models/cityModel');
const redis = require('../database/redisConnection');

class CityController {
    async findId(cityData) {
        try {
            // const cachedCity = await redis.get(`city:${cityData.name}`);
    
            // if (cachedCity) {
            //     console.log('從 Redis 中取得城市id');
            //     return JSON.parse(cachedCity);
            // } 
            // else {
            const [cityRecord, created] = await City.findOrCreate({
                where: { google_id: cityData.google_id },
                defaults: cityData,
                raw: true,
            });
            // await redis.set(`city:${cityData.name}`, JSON.stringify(city.id), 'EX', 259200);
            return cityRecord.id || created.id
            
            // }
        } catch (error) {
            console.error('資料庫操作 City.findOrCreate 出錯:', error);
            throw error
        }
    }

    async getAllCities() {
        try {
            const cities = await City.findAll();
            if(cities.length === 0){
                throw new Error('No cities found.');
            }
            return cities;
        } 
        catch (error) {
            console.error('Error retrieving cities:', error);
            throw error;
        }
    }

    async mapToCityId(cityName){
        try{
            const city = await City.findOne({
                where: { name_eng: cityName },
                attributes: ['id']
            });
            if(!city){
                throw new Error(`City with name '${cityName}' not found.`);
            }
            return city.id;
        }
        catch (error) {
            console.error(`Error mapping city ID for ${cityName}:`, error);
            throw error;
        }
    }
}

const cityController = new CityController();

module.exports = cityController;
