const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const StudentInfo = sequelize.define(
  "student_info",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    note: { type: DataTypes.STRING, allowNull: true },
  },
  {
    tableName: "student_infos",
    timestamps: true,
  }
);

module.exports = StudentInfo;
