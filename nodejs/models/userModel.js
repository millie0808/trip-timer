const { DataTypes } = require('sequelize');
const db = require('../database/mysqlConnection');

const User = db.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true,
            indexes: [
                {
                    unique: true,
                    fields: ['email'],
                    using: 'HASH',
                },
            ]
        },
        password: {
            type: DataTypes.STRING(255),
        },
        avatar: {
            type: DataTypes.STRING(255),
        },
    }, {
        tableName: 'user',
    }
);

module.exports = User;
  