const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Calendar = sequelize.define(
  "calendar",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    class_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    class_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    repeat: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  },
  {
    tableName: "calendars",
    timestamps: true,
  }
);

module.exports = Calendar;
