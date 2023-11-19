const { DataTypes } = require('sequelize');
const db = require('../database/connection');
const City = require('./cityModel');
const Trip = require('./tripModel');
const SiteTag = require('./siteTagModel');

const CustomSite = db.define('CustomSite', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        address: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(255),
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        lng: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        day_order: {
            type: DataTypes.INTEGER,
        },
        site_order: {
            type: DataTypes.INTEGER,
        },
    }, {
        tableName: 'custom_site',
        timestamps: false
    }
);
CustomSite.belongsTo(City, { foreignKey: 'city_id' });
CustomSite.belongsTo(Trip, { foreignKey: 'trip_id' });
CustomSite.belongsTo(SiteTag, { foreignKey: 'tag_id' });

module.exports = CustomSite;