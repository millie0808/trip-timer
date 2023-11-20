const { DataTypes } = require('sequelize');
const db = require('../database/connection');
const City = require('./cityModel');

const Trip = db.define('Trip', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        number: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        }
    }, {
        tableName: 'trip',
        timestamps: false
    }
);
Trip.belongsTo(City, { foreignKey: 'city_id', as: 'city' });

module.exports = Trip;
  