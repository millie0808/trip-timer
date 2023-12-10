const Site = require('../models/siteModel');
const redis = require('../database/redisConnection');

class SiteController {
    // async getSitesByCityId(cityId){
    //     try{
    //         const sites = await Site.findAll({
    //             where: { city_id: cityId },
    //         })
    //         if(sites.length === 0){
    //             throw new Error('No sites found.');
    //         }
    //         return sites;
    //     }
    //     catch(error){
    //         console.error('Error retrieving sites:', error);
    //         throw error;
    //     }
    // }

    // async findIdByGoogleId(google_id){
    //     try{
    //         const cachedSite = await redis.get(`site:${google_id}`);
    //         if(cachedSite){
    //             console.log('從 Redis 中取得景點id');
    //             return JSON.parse(cachedTrip);
    //         }
    //     } catch (error){

    //     }
    // }

    async handleSite(scheduleObj) {
        const sites = Object.values(scheduleObj).flat();
        let siteIds = [];
        for (const siteData of sites) {
            const [siteRecord, created] = await Site.findOrCreate({
                where: { google_id: siteData.google_id },
                defaults: siteData,
                raw: true,
            });
            siteIds.push(siteRecord.id || created.id);
        }
        return siteIds;
    }
}

const siteController = new SiteController();

module.exports = siteController;