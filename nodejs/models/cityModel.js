const { DataTypes } = require('sequelize');
const db = require('../database/mysqlConnection');

const City = db.define('city', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        google_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            indexes: [
                {
                    unique: true,
                    fields: ['google_id'],
                    using: 'HASH',
                },
            ]
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        country: {
            type: DataTypes.STRING(255),
        },
        lat: {
            type: DataTypes.FLOAT(17, 14),
            allowNull: false,
        },
        lng: {
            type: DataTypes.FLOAT(17, 14),
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING(255),
        },
        continent: {
            type: DataTypes.STRING(255),
        },
    }, {
        tableName: 'city',
        timestamps: false
    }
);

module.exports = City;