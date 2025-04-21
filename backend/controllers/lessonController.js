const moment = require("moment");
const { Lesson, User, ClassType, Calendar, sequelize } = require("../models");
const { user_role } = require("../configs/key");
const { Op, where } = require("sequelize");
/**
 * @desc Get all lessons with related details
 * @route GET /api/lessons
 */
exports.getAllLessons = async (req, res) => {
  try {
    const lessons = await Lesson.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
          required: false,
        },
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.teacher },
          required: false,
        },
        {
          model: ClassType,
          attributes: ["id", "name"],
          required: false,
        },
        {
          model: Calendar,
          as: "CalendarLink", // use the alias
          attributes: ["startDate", "endDate"],
          required: false,
          on: {
            [Op.and]: [
              where(
                sequelize.col("lesson.calendar_id"),
                "=",
                sequelize.col("CalendarLink.id")
              ),
            ],
          },
        },
      ],
    });
    res.status(200).json(lessons);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching lessons", error });
  }
};

/**
 * @desc Get a lesson by ID
 * @route GET /api/lessons/:id
 */
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findOne({
      where: { id: req.params.id },
      include: [
        { model: User, attributes: ["first_name", "last_name"] },
        { model: ClassType, attributes: ["name"] },
      ],
    });

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    res.status(200).json(lesson);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching lesson", error });
  }
};

/**
 * @desc Create a new lesson
 * @route POST /api/lessons
 */
exports.createLesson = async (req, res) => {
  try {
    const { class_date, student_id, teacher_id, class_type_id } = req.body;

    // Check if student, teacher, and class type exist
    const student = await User.findByPk(student_id);
    const teacher = await User.findByPk(teacher_id);
    const classType = await ClassType.findByPk(class_type_id);

    if (!student) return res.status(404).json({ msg: "Student not found" });
    if (!teacher) return res.status(404).json({ msg: "Teacher not found" });
    if (!classType)
      return res.status(404).json({ msg: "Class type not found" });

    // Create lesson
    const lesson = await Lesson.create({
      lesson_date: class_date,
      student_id,
      teacher_id,
      class_type_id,
      calendar_id: 0,
    });

    const lessons = await Lesson.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
        },
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.teacher },
        },
        {
          model: ClassType,
          attributes: ["id", "name"],
        },
      ],
    });
    res.status(201).json({ msg: "Lesson created successfully", lessons });
  } catch (error) {
    res.status(500).json({ msg: "Error creating lesson", error });
  }
};

/**
 * @desc Update a lesson
 * @route PUT /api/lessons/:id
 */
exports.updateLesson = async (req, res) => {
  try {
    const { class_date, student_id, teacher_id, class_type_id } = req.body;
    const lesson = await Lesson.findByPk(req.params.id);

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    await lesson.update({
      class_date,
      student_id,
      teacher_id,
      class_type_id,
    });

    res.status(200).json({ msg: "Lesson updated successfully", lesson });
  } catch (error) {
    res.status(500).json({ msg: "Error updating lesson", error });
  }
};

/**
 * @desc Delete a lesson
 * @route DELETE /api/lessons/:id
 */
exports.deleteLesson = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);

    if (!lesson) return res.status(404).json({ msg: "Lesson not found" });

    await lesson.destroy();

    res.status(200).json({ msg: "Lesson deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting lesson", error });
  }
};

exports.dailyReport = async () => {
  try {
    const lessons = await Lesson.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
        },
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.teacher },
        },
        {
          model: ClassType,
          attributes: ["id", "name"],
        },
      ],
    });

    return lessons.map((lesson, key) => ({
      id: key + 1,
      student_name: `${lesson.Student.first_name} ${lesson.Student.last_name}`,
      teacher_name: `${lesson.Teacher.first_name} ${lesson.Teacher.last_name}`,
      class_type: lesson.class_type.name,
      class_date: moment(lesson.class_date).format("DD/MM/YYYY"),
      created_at: moment(lesson.createdAt).format("DD/MM/YYYY"),
      updated_at: moment(lesson.updatedAt).format("DD/MM/YYYY"),
    }));
  } catch (error) {
    console.log("Error fetching lessons", error);
  }
};
