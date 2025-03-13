const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const TeacherRate = sequelize.define(
  "TeacherRate",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    class_type_id: { type: DataTypes.INTEGER, allowNull: false },
    rate: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  },
  {
    tableName: "teacher_rates",
    timestamps: true,
  }
);

module.exports = TeacherRate;
