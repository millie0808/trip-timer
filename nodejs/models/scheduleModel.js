const { DataTypes } = require('sequelize');
const db = require('../database/connection');
const Trip = require('./tripModel');
const Site = require('./siteModel');

const Schedule = db.define('Schedule', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        description: {
            type: DataTypes.STRING(255),
        },
        day_order: {
            type: DataTypes.INTEGER,
        },
        site_order: {
            type: DataTypes.INTEGER,
        },
    }, {
        tableName: 'schedule',
        timestamps: false
    }
);
Schedule.belongsTo(Trip, { foreignKey: 'trip_id' });
Schedule.belongsTo(Site, { foreignKey: 'site_id' });

module.exports = Schedule;