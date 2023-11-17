const Site = require('../models/siteModel');

class SiteController {
    async getSitesByCityId(cityId){
        try{
            const sites = await Site.findAll({
                where: { city_id: cityId },
            })
            if(sites.length === 0){
                throw new Error('No sites found.');
            }
            return sites;
        }
        catch(error){
            console.error('Error retrieving sites:', error);
            throw error;
        }
    }
}

const siteController = new SiteController();

module.exports = siteController;