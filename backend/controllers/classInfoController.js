const { ClassInfo, User } = require("../models");
const { user_role } = require("../configs/key");

exports.getAllClassInfo = async (req, res) => {
  try {
    const studentId = req?.params?.studentId;
    const teacherId = req?.query?.teacher_id;

    const whereClause = { student_id: studentId };
    if (teacherId) {
      const temp = await ClassInfo.findAll({
        where: { teacher_id: teacherId },
      });
      if (temp.length > 0) {
        whereClause.teacher_id = teacherId;
      }
    }

    const classInfos = await ClassInfo.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
        },
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
        },
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

exports.updateClassInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, course, unit, can_do, notes, teacher_id } = req.body;

    // First check if the class info exists and belongs to the current teacher
    const classInfo = await ClassInfo.findOne({
      where: {
        id: id,
        teacher_id: teacher_id,
      },
    });

    if (!classInfo) {
      return res.status(403).json({
        msg: "You don't have permission to edit this class info or it doesn't exist",
      });
    }

    // Update the class info
    await classInfo.update({
      date,
      course,
      unit,
      can_do,
      notes,
    });

    // Fetch updated list
    const updatedClassInfo = await ClassInfo.findAll({
      where: { student_id: classInfo.student_id },
      include: [
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["date", "DESC"]],
    });

    res.status(200).json({
      msg: "Class info updated successfully",
      classInfo: updatedClassInfo,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error updating class info", error });
  }
};
