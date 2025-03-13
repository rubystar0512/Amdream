const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Payment = sequelize.define(
  "Payment",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    student_id: { type: DataTypes.INTEGER, allowNull: false },
    class_type_id: { type: DataTypes.INTEGER, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    num_lessons: { type: DataTypes.INTEGER, allowNull: false },
    payment_method: { type: DataTypes.STRING, allowNull: false },
    payment_date: { type: DataTypes.DATEONLY, allowNull: false },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

module.exports = Payment;
