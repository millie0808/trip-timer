const { DataTypes } = require('sequelize');
const db = require('../database/connection');

const SiteTag = db.define('SiteTag', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        name_eng: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    }, {
        tableName: 'site_tag',
        timestamps: false
    }
);

module.exports = SiteTag;