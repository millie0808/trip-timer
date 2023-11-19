const { DataTypes } = require('sequelize');
const db = require('../database/connection');
const City = require('./cityModel');
const SiteTag = require('./siteTagModel');

const Site = db.define('Site', {
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
        },
        lat: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        lng: {
            type: DataTypes.FLOAT,
            allowNull: false,
        }
    }, {
        tableName: 'site',
        timestamps: false
    }
);
Site.belongsTo(City, { foreignKey: 'city_id' });
Site.belongsTo(SiteTag, { foreignKey: 'tag_id' });

module.exports = Site;