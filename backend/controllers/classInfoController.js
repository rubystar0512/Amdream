const { ClassInfo, User } = require("../models");
const { user_role } = require("../configs/key");

exports.getAllClassInfo = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const teacherId = req.query?.teacher_id;

    const whereClause = { student_id: studentId };
    if (teacherId) {
      whereClause.teacher_id = teacherId;
    }

    const classInfos = await ClassInfo.findAll({
      where: whereClause,
      include: [
        { model: User, as: "Student", attributes: ["first_name", "last_name"] },
        { model: User, as: "Teacher", attributes: ["first_name", "last_name"] },
      ],
      order: [["date", "DESC"]],
    });
    res.status(200).json(classInfos);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching class info", error });
  }
};

exports.createClassInfo = async (req, res) => {
  try {
    const { course, unit, can_do, notes, date, student_id, teacher_id } =
      req.body;

    const classInfo = await ClassInfo.create({
      course,
      unit,
      can_do,
      notes,
      date,
      student_id,
      teacher_id,
    });

    // Fetch updated class info list
    const classInfos = await ClassInfo.findAll({
      where: { student_id },
      order: [["date", "DESC"]],
    });

    res
      .status(201)
      .json({ msg: "Class info added successfully", classInfo: classInfos });
  } catch (error) {
    res.status(500).json({ msg: "Error creating class info", error });
  }
};
