const { DataTypes } = require('sequelize');
const db = require('../database/connection');

const City = db.define('City', {
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
        country: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        country_eng: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        lat: {
            type: DataTypes.FLOAT(17, 14),
            allowNull: false,
        },
        lng: {
            type: DataTypes.FLOAT(17, 14),
            allowNull: false,
        }
    }, {
        tableName: 'city',
        timestamps: false
    }
);

// db.sync()
// .then(() => {
//   console.log('資料庫同步完成');
//   // 插入檢索城市的程式碼
//   return City.findAll();
// })
// .then((cities) => {
//   console.log('檢索到的城市:', cities);
// })
// .catch((err) => {
//   console.error('錯誤訊息:', err);
// });

module.exports = City;