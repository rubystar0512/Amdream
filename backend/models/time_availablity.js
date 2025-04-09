const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const TimeAvailablity = sequelize.define(
  "time_availablity",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "time_availablity",
    timestamps: true,
  }
);

module.exports = TimeAvailablity;
