const { DataTypes } = require('sequelize');
const db = require('../database/mysqlConnection');
const City = require('./cityModel');
const User = require('./userModel');

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
            indexes: [
                {
                    unique: true,
                    fields: ['number'],
                    using: 'HASH',
                },
            ],
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        name: {
            type: DataTypes.STRING,
        }
    }, {
        tableName: 'trip',
    }
);
Trip.belongsTo(City, { foreignKey: 'city_id', as: 'city' });
Trip.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = Trip;
  