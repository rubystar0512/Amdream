const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const ClassType = sequelize.define(
  "class_type",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "class_types",
    timestamps: true,
  }
);

module.exports = ClassType;
