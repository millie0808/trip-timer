const City = require('../models/cityModel');

class CityController {
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
