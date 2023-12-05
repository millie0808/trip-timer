const { DataTypes } = require('sequelize');
const db = require('../database/mysqlConnection');

const Site = db.define('site', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        google_id: {
            type: DataTypes.STRING(255),
            allowNull: false,
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

module.exports = Site;