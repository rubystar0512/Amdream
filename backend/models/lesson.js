const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Lesson = sequelize.define(
  "lesson",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    lesson_date: { type: DataTypes.DATEONLY, allowNull: false },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    teacher_id: { type: DataTypes.INTEGER, allowNull: false },
    class_type_id: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    tableName: "lessons",
    timestamps: true,
  }
);

module.exports = Lesson;
