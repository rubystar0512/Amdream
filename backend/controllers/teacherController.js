const moment = require("moment");
const bcrypt = require("bcryptjs");
const { TeacherRate, ClassType, User, Calendar, Lesson } = require("../models");
const { user_role } = require("../configs/key");
const { Op, Sequelize } = require("sequelize");
/**
 * @desc Get all teachers with their rates
 * @route GET /api/teachers
 */
exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
      include: {
        model: TeacherRate,
        include: { model: ClassType, attributes: ["name"] },
      },
    });
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching teachers", error });
  }
};

/**
 * @desc Create a new teacher
 * @route POST /api/teachers
 */
exports.createTeacher = async (req, res) => {
  try {
    const { first_name, last_name, rates, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    // Create the teacher
    const teacher = await User.create({
      first_name,
      last_name,
      role_id: user_role.teacher,
      email,
      password: hashedPassword,
    });

    // Create rates if provided
    if (rates && rates.length > 0) {
      const teacherRates = rates.map((rate) => ({
        teacher_id: teacher.id,
        class_type_id: rate.class_type_id,
        rate: rate.rate,
      }));
      await TeacherRate.bulkCreate(teacherRates);
    }

    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
      include: {
        model: TeacherRate,
        include: { model: ClassType, attributes: ["name"] },
      },
    });
    res.status(201).json({ msg: "Teacher created successfully", teachers });
  } catch (error) {
    res.status(500).json({ msg: "Error creating teacher", error });
  }
};

/**
 * @desc Update a teacher's info
 * @route PUT /api/teachers/:id
 */
exports.updateTeacher = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;
    const teacher = await User.findOne({
      where: { id: req.params.id, role_id: user_role.teacher },
    });

    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await teacher.update({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
    } else {
      await teacher.update({ first_name, last_name, email });
    }
    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
      include: {
        model: TeacherRate,
        include: { model: ClassType, attributes: ["name"] },
      },
    });
    res.status(200).json({ msg: "Teacher updated successfully", teachers });
  } catch (error) {
    res.status(500).json({ msg: "Error updating teacher", error });
  }
};

/**
 * @desc Delete a teacher
 * @route DELETE /api/teachers/:id
 */
exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await User.findOne({
      where: { id: req.params.id, role_id: user_role.teacher },
    });

    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

    await teacher.destroy();

    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
      include: {
        model: TeacherRate,
        include: { model: ClassType, attributes: ["name"] },
      },
    });

    res.status(200).json({ msg: "Teacher deleted successfully", teachers });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting teacher", error });
  }
};

/**
 * @desc Add or update a teacher's rate for a class type
 * @route POST /api/teachers/:id/rates
 */
exports.setTeacherRates = async (req, res) => {
  try {
    const { rates } = req.body; // rates should be an array [{ class_type_id, rate }]
    const teacher_id = req.params.id;

    const teacher = await User.findOne({
      where: { id: teacher_id, role_id: user_role.teacher },
    });
    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });

    for (const rateData of rates) {
      const eachRate = await TeacherRate.findOne({
        where: {
          teacher_id,
          class_type_id: rateData.class_type_id,
        },
      });

      if (!eachRate) {
        const teacherRates = {
          teacher_id: teacher_id,
          class_type_id: rateData.class_type_id,
          rate: rateData.rate,
        };
        await TeacherRate.create(teacherRates);
      } else await eachRate.update({ rate: rateData.rate });
    }

    res.status(200).json({ msg: "Teacher rates updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error updating rates", error });
  }
};

exports.dailyReport = async () => {
  try {
    const teachers = await User.findAll({
      where: { role_id: user_role.teacher },
    });

    return teachers.map((teacher, key) => ({
      id: key + 1,
      full_name: `${teacher.first_name} ${teacher.last_name}`,
      created_at: moment(teacher.createdAt).format("DD/MM/YYYY"),
      updated_at: moment(teacher.updatedAt).format("DD/MM/YYYY"),
    }));
  } catch (error) {
    console.log("Error fetching teachers", error);
  }
};

exports.getTeacherStudents = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    // Get students who have had lessons with this teacher
    const students = await User.findAll({
      where: { role_id: user_role.student },
      include: [
        {
          model: Lesson,
          as: "StudentLessons",
          where: {
            teacher_id: teacherId,
          },
          attributes: [],
          required: true,
        },
      ],
      attributes: [
        "id",
        "first_name",
        "last_name",
        [
          Sequelize.fn("COUNT", Sequelize.col("StudentLessons.id")),
          "class_count",
        ],
      ],
      group: ["user.id", "user.first_name", "user.last_name"],
    });

    // Get information about students with multiple teachers (but only if they've had lessons with this teacher)
    const studentIds = students.map((student) => student.id);

    // Get students with multiple teachers (only those who have had lessons with this teacher)
    const studentsWithMultipleTeachers = await User.findAll({
      where: {
        role_id: user_role.student,
        id: { [Op.in]: studentIds },
      },
      include: [
        {
          model: Lesson,
          as: "StudentLessons",
          attributes: [],
          required: true,
        },
      ],
      attributes: [
        "id",
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.literal("DISTINCT StudentLessons.teacher_id")
          ),
          "teacher_count",
        ],
      ],
      having: Sequelize.literal("teacher_count >= 2"),
      group: ["user.id"],
    });

    // Get upcoming scheduled classes for these students
    const studentsWithSchedule = await User.findAll({
      where: {
        role_id: user_role.student,
        id: { [Op.in]: studentIds },
      },
      include: [
        {
          model: Calendar,
          as: "studentCalendars",
          where: {
            teacher_id: teacherId,
            startDate: { [Op.gte]: new Date() },
            class_status: ["scheduled", "confirmed"],
          },
          required: true,
          attributes: [],
        },
      ],
      attributes: ["id"],
      group: ["user.id"],
    });

    // Combine all students - only those who have had lessons with this teacher
    const studentMap = new Map();

    // Add all students who have had lessons with this teacher
    students.forEach((student) => {
      studentMap.set(student.id, {
        ...student.toJSON(),
        class_count: parseInt(student.get("class_count")),
        has_multiple_teachers: false,
        has_upcoming_classes: false,
      });
    });

    // Mark students with multiple teachers
    studentsWithMultipleTeachers.forEach((student) => {
      if (studentMap.has(student.id)) {
        const existingStudent = studentMap.get(student.id);
        studentMap.set(student.id, {
          ...existingStudent,
          has_multiple_teachers: true,
        });
      }
    });

    // Mark students with upcoming classes
    studentsWithSchedule.forEach((student) => {
      if (studentMap.has(student.id)) {
        const existingStudent = studentMap.get(student.id);
        studentMap.set(student.id, {
          ...existingStudent,
          has_upcoming_classes: true,
        });
      }
    });

    const uniqueStudents = Array.from(studentMap.values());

    res.status(200).json(uniqueStudents);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error fetching teacher's students", error });
  }
};
