const { Op } = require("sequelize");
const User = require("../models/user");
const Student_Info = require("../models/student_info");
const Lesson = require("../models/lesson");
const TeacherRate = require("../models/teacher_rate");
const Payment = require("../models/payment");
const ClassType = require("../models/class_type");
const user_role = require("../configs/key").user_role;

// Get list of students with class stats
exports.classState = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role_id: user_role.student },
    });

    const studentStats = await Promise.all(
      students.map(async (student) => {
        // Get all payments excluding trial lessons
        const totalClasses = await Payment.findAll({
          where: {
            student_id: student.id,
            class_type_id: {
              [Op.ne]: (
                await ClassType.findOne({ where: { name: "Trial-Lesson" } })
              )?.id,
            },
          },
        });

        let total = 0;
        totalClasses.map((item) => {
          total += item.num_lessons;
        });

        // Get count of completed lessons excluding trials
        const paidClasses = await Lesson.count({
          where: {
            student_id: student.id,
            class_type_id: {
              [Op.ne]: (
                await ClassType.findOne({ where: { name: "Trial-Lesson" } })
              )?.id,
            },
          },
        });

        const unpaidClasses = total - paidClasses;

        // Only return students who have non-trial classes
        if (total > 0) {
          return {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            total_classes: total,
            paid_classes: paidClasses,
            unpaid_classes: unpaidClasses,
          };
        }
        return null;
      })
    );

    // Filter out null values (students with only trial lessons)
    const filteredStats = studentStats.filter((stat) => stat !== null);

    res.json(filteredStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get teacher salary breakdown (filtered by date)

exports.teachSalary = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const whereClause = {};
    if (start_date && end_date) {
      whereClause.class_date = { [Op.between]: [start_date, end_date] };
    }

    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
    });

    const teacherStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Fetch lessons and include ClassType to access class type names
        const lessons = await Lesson.findAll({
          where: { teacher_id: teacher.id, ...whereClause },
          include: [{ model: ClassType, attributes: ["name"] }],
        });

        // Initialize an object to store salary and class count per class type
        const classTypeStats = {};

        for (const lesson of lessons) {
          const classTypeName = lesson.class_type?.name;
          if (!classTypeName) continue;

          let rate = await TeacherRate.findOne({
            where: {
              teacher_id: teacher.id,
              class_type_id: lesson.class_type_id,
            },
          });

          if (classTypeName === "No Show") {
            const regularClassType = await ClassType.findOne({
              where: { name: "Regular-Lesson" },
            });
            if (regularClassType) {
              rate = await TeacherRate.findOne({
                where: {
                  teacher_id: teacher.id,
                  class_type_id: regularClassType.id,
                },
              });
            }
          } else if (classTypeName === "Trial-Lesson No Show") {
            const trialClassType = await ClassType.findOne({
              where: { name: "Trial-Lesson" },
            });
            if (trialClassType) {
              rate = await TeacherRate.findOne({
                where: {
                  teacher_id: teacher.id,
                  class_type_id: trialClassType.id,
                },
              });
            }
          }

          const rateAmount = rate ? parseFloat(rate.rate) : 0;

          if (!classTypeStats[classTypeName]) {
            classTypeStats[classTypeName] = {
              total_classes: 0,
              total_salary: 0,
            };
          }
          classTypeStats[classTypeName].total_classes += 1;
          classTypeStats[classTypeName].total_salary += rateAmount;
        }

        // Format result by class type
        const formattedStats = Object.keys(classTypeStats).map(
          (classTypeName) => ({
            class_type: classTypeName,
            total_classes_taught: classTypeStats[classTypeName].total_classes,
            total_salary: classTypeStats[classTypeName].total_salary.toFixed(2),
          })
        );

        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          class_type_stats: formattedStats,
        };
      })
    );

    res.json(teacherStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.teachEachSalary = async (req, res) => {
  const { id } = req.params;
  try {
    const { start_date, end_date } = req.body;

    const whereClause = {};
    if (start_date && end_date) {
      whereClause.class_date = { [Op.between]: [start_date, end_date] };
    }

    const teachers = await User.findAll({
      where: { role_id: user_role.teacher, id },
    });

    const teacherStats = await Promise.all(
      teachers.map(async (teacher) => {
        // Fetch lessons and include ClassType to access class type names
        const lessons = await Lesson.findAll({
          where: { teacher_id: teacher.id, ...whereClause },
          include: [{ model: ClassType, attributes: ["name"] }],
        });

        // Initialize an object to store salary and class count per class type
        const classTypeStats = {};

        for (const lesson of lessons) {
          const classTypeName = lesson.class_type?.name;
          if (!classTypeName) continue;

          let rate = await TeacherRate.findOne({
            where: {
              teacher_id: teacher.id,
              class_type_id: lesson.class_type_id,
            },
          });

          if (classTypeName === "No Show") {
            const regularClassType = await ClassType.findOne({
              where: { name: "Regular-Lesson" },
            });
            if (regularClassType) {
              rate = await TeacherRate.findOne({
                where: {
                  teacher_id: teacher.id,
                  class_type_id: regularClassType.id,
                },
              });
            }
          } else if (classTypeName === "Trial-Lesson No Show") {
            const trialClassType = await ClassType.findOne({
              where: { name: "Trial-Lesson" },
            });
            if (trialClassType) {
              rate = await TeacherRate.findOne({
                where: {
                  teacher_id: teacher.id,
                  class_type_id: trialClassType.id,
                },
              });
            }
          }

          const rateAmount = rate ? parseFloat(rate.rate) : 0;

          if (!classTypeStats[classTypeName]) {
            classTypeStats[classTypeName] = {
              total_classes: 0,
              total_salary: 0,
            };
          }
          classTypeStats[classTypeName].total_classes += 1;
          classTypeStats[classTypeName].total_salary += rateAmount;
        }

        // Format result by class type
        const formattedStats = Object.keys(classTypeStats).map(
          (classTypeName) => ({
            class_type: classTypeName,
            total_classes_taught: classTypeStats[classTypeName].total_classes,
            total_salary: classTypeStats[classTypeName].total_salary.toFixed(2),
          })
        );

        return {
          id: teacher.id,
          name: `${teacher.first_name} ${teacher.last_name}`,
          class_type_stats: formattedStats,
        };
      })
    );

    res.json(teacherStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.classEachState = async (req, res) => {
  const { id } = req.params;
  try {
    const students = await User.findAll({
      where: { role_id: user_role.student, id },
    });

    const studentStats = await Promise.all(
      students.map(async (student) => {
        // Get all payments excluding trial lessons
        const totalClasses = await Payment.findAll({
          where: {
            student_id: student.id,
            class_type_id: {
              [Op.ne]: (
                await ClassType.findOne({ where: { name: "Trial-Lesson" } })
              )?.id,
            },
          },
        });

        let total = 0;
        totalClasses.map((item) => {
          total += item.num_lessons;
        });

        // Get count of completed lessons excluding trials
        const paidClasses = await Lesson.count({
          where: {
            student_id: student.id,
            class_type_id: {
              [Op.ne]: (
                await ClassType.findOne({ where: { name: "Trial-Lesson" } })
              )?.id,
            },
          },
        });

        const unpaidClasses = total - paidClasses;

        // Only return students who have non-trial classes
        if (total > 0) {
          return {
            id: student.id,
            name: `${student.first_name} ${student.last_name}`,
            total_classes: total,
            paid_classes: paidClasses,
            unpaid_classes: unpaidClasses,
          };
        }
        return null;
      })
    );

    // Filter out null values (students with only trial lessons)
    const filteredStats = studentStats.filter((stat) => stat !== null);

    res.json(filteredStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
