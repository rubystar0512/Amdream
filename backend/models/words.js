const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Word = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    student_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    english_word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    translation_word: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "words",
    timestamps: true,
  }
);

module.exports = Word;
