const { Word, User } = require("../models");
const { user_role } = require("../configs/key");

exports.getAllWords = async (req, res) => {
  try {
    const studentId = req?.params?.studentId;
    const teacherId = req?.query?.teacher_id;

    const whereClause = { student_id: studentId };
    if (teacherId) {
      const temp = await Word.findAll({
        where: { teacher_id: teacherId },
      });
      if (temp.length > 0) {
        whereClause.teacher_id = teacherId;
      }
    }

    const words = await Word.findAll({
      where: whereClause,
      include: [
        { model: User, as: "Student", attributes: ["first_name", "last_name"] },
        { model: User, as: "Teacher", attributes: ["first_name", "last_name"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching words", error });
  }
};

exports.createWord = async (req, res) => {
  try {
    const { english_word, translation_word, student_id, teacher_id } = req.body;

    const word = await Word.create({
      english_word,
      translation_word,
      student_id,
      teacher_id,
    });

    // Fetch updated words list
    const words = await Word.findAll({
      where: { student_id },
      order: [["createdAt", "DESC"]],
    });

    res.status(201).json({ msg: "Word added successfully", words });
  } catch (error) {
    res.status(500).json({ msg: "Error creating word", error });
  }
};
