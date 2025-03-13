const User = require("./user");
const TeacherRate = require("./teacher_rate");
const Lesson = require("./lesson");
const ClassType = require("./class_type");
const Payment = require("./payment");
const Role = require("./role");
const Permission = require("./permission");
const Menu = require("./menu");
const StudentInfo = require("./student_info");
const sequelize = require("./db");

User.hasMany(StudentInfo, { foreignKey: "student_id", onDelete: "CASCADE" });
User.hasMany(Lesson, { foreignKey: "student_id", onDelete: "CASCADE" });
User.hasMany(Lesson, { foreignKey: "teacher_id", onDelete: "CASCADE" });
User.hasMany(Payment, { foreignKey: "student_id", onDelete: "CASCADE" });
Lesson.belongsTo(User, { as: "Student", foreignKey: "student_id" });
Lesson.belongsTo(User, { as: "Teacher", foreignKey: "teacher_id" });
Payment.belongsTo(User, { as: "Student", foreignKey: "student_id" });
StudentInfo.belongsTo(User, { as: "Student", foreignKey: "student_id" });
User.hasMany(TeacherRate, {
  foreignKey: "teacher_id",
  onDelete: "CASCADE",
});

TeacherRate.belongsTo(User, {
  foreignKey: "teacher_id",
  onDelete: "CASCADE",
});
TeacherRate.belongsTo(ClassType, { foreignKey: "class_type_id" });

ClassType.hasMany(TeacherRate, {
  foreignKey: "class_type_id",
  onDelete: "CASCADE",
});

Lesson.belongsTo(ClassType, { foreignKey: "class_type_id" });
ClassType.hasMany(Lesson, { foreignKey: "class_type_id", onDelete: "CASCADE" });

Payment.belongsTo(ClassType, { foreignKey: "class_type_id" });
ClassType.hasMany(Payment, {
  foreignKey: "class_type_id",
  onDelete: "CASCADE",
});

Permission.belongsTo(Menu, { foreignKey: "menu_id" });
Permission.belongsTo(Role, { foreignKey: "role_id" });

User.belongsTo(Role, { foreignKey: "role_id" });
Role.hasMany(Permission, { foreignKey: "role_id", onDelete: "CASCADE" });

module.exports = {
  sequelize,
  ClassType,
  TeacherRate,
  User,
  Lesson,
  Payment,
  Role,
  Permission,
  StudentInfo,
  Menu,
};
