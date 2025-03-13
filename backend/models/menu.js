const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Menu = sequelize.define(
  "menu",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    menu_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    menu_icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    route: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "menus",
    timestamps: true,
  }
);

module.exports = Menu;
