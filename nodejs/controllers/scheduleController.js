const Schedule = require('../models/scheduleModel');

class ScheduleController {
    async createSchedule(scheduleDataList){
        try{
            scheduleDataList.forEach( async (scheduleData) => {
                const newSchedule = await Schedule.create(scheduleData);
            });
        }
        catch(error){
            console.error('Error creating schedule:', error);
            throw error;
        }
    }

    // async getSchedule() {
    //     try {
    //         const trips = await Schedule.findAll();
    //         return trips;
    //     } 
    //     catch (error) {
    //         console.error('Error retrieving schedule:', error);
    //         throw error;
    //     }
    // }

    async mapToScheduleData(newTripJSON, tripId){
        try{
            // 檢查必要的資料是否存在
            if (!newTripJSON || !newTripJSON.site || newTripJSON.site == {} || !tripId) {
                throw new Error('Bad Request. Please provide valid data.');
            }
            let scheduleDataList = [];
            for(const day in newTripJSON.site){
                for(let i=0;i<newTripJSON.site[day].length;i++){
                    const scheduleData = {
                        trip_id: tripId,
                        site_id: newTripJSON.site[day][i],
                        day_order: day,
                        site_order: i
                    }
                    scheduleDataList.push(scheduleData);
                }
            }
            return scheduleDataList;
        }
        catch(error){
            console.error('Error mapping to schedule data:', error);
            throw error;
        }
    }

}

const scheduleController = new ScheduleController();

module.exports = scheduleController;