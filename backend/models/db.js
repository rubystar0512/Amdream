const { Sequelize } = require("sequelize");
const config = require("../configs/key");

const sequelize = new Sequelize(
  config.database.dbname,
  config.database.user_name,
  config.database.user_pass,
  {
    host: config.database.host,
    dialect: config.database.type,
  }
);

module.exports = sequelize;
