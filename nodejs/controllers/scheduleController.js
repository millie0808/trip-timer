const Schedule = require('../models/scheduleModel');
const Site = require('../models/siteModel');
class ScheduleController {
    async createSchedule(siteIds, schedules, durations, tripId){
        try{
            let i = 0;
            for (const day in schedules){
                for(let j = 0; j < schedules[day].length; j++){
                    await Schedule.create({
                        trip_id: tripId,
                        site_id: siteIds[i],
                        day_order: day,
                        site_order: j,
                        mode: durations[day][j]?.mode || null,
                        duration: durations[day][j]?.duration || null,
                    })
                    i = i + 1;
                }
            }
        }
        catch(error){
            console.error('Error creating schedule:', error);
            throw error;
        }
    }

    async getSchedule(trip) {
        try {
            const schedule = await Schedule.findAll({
                where: {trip_id: trip.id},
                attributes: { exclude: ['trip_id', 'site_id'] },
                include: {
                    model: Site,
                    attributes: { exclude: ['id'] },
                    as: 'site',
                    order: [['day_order', 'ASC'], ['site_order', 'ASC']],
                },
                raw: true,
            });
            const numberOfDays = countNumberOfDays(trip.start_date, trip.end_date);
            let scheduleData = {};
            for(let i = 0; i < numberOfDays; i++){
                scheduleData[i] = schedule.filter(item => item.day_order === i);;
            }
            return scheduleData
        } 
        catch (error) {
            console.error('Error retrieving schedule:', error);
            throw error;
        }
    }

    async deleteSchedule(tripId){
        Schedule.destroy({ where: { trip_id: tripId } });
    }

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

function countNumberOfDays(start, end){
    const startDate = new Date(start);
    const endDate = new Date(end);

    const timeDifference = endDate.getTime() - startDate.getTime();
    const daysDifference = timeDifference / (1000 * 3600 * 24);

    const days = Math.round(daysDifference) + 1;
    return days
}