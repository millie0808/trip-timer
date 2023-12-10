const { Sequelize } = require('sequelize');

const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;

const db = new Sequelize(
  dbName, 
  dbUser, 
  dbPassword, 
  {
      host: dbHost,
      dialect: 'mysql',
      port: 3306,
  }
);

// Test the connection
(async () => {
  try {
    await db.authenticate();
    console.log('Connection to the database has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
})();
  
module.exports = db;