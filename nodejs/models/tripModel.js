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
        timestamps: false,
        hooks: {
            beforeCreate: (trip) => {
                // 在創建訂單之前生成編號
                trip.number = generateTripNumber();
            },
        }
    }
);
Trip.belongsTo(City, { foreignKey: 'city_id', as: 'City' });

function generateTripNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const randomSuffix = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
    return `${year}${month}${day}${randomSuffix}`;
}

module.exports = Trip;
  