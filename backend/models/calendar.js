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
    class_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    class_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    recurrenceRule: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "calendars",
    timestamps: true,
  }
);

module.exports = Calendar;
