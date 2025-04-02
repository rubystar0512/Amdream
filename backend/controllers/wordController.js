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

    const whereClause = { student_id: student_id };
    if (teacher_id) {
      const temp = await Word.findAll({
        where: { teacher_id: teacher_id },
      });
      if (temp.length > 0) {
        whereClause.teacher_id = teacher_id;
      }
    }

    const words = await Word.findAll({
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
      order: [["createdAt", "DESC"]],
    });

    res.status(201).json({ msg: "Word added successfully", words });
  } catch (error) {
    res.status(500).json({ msg: "Error creating word", error });
  }
};

exports.updateWord = async (req, res) => {
  try {
    const { id } = req.params;
    const { english_word, translation_word, teacher_id } = req.body;

    // Check if the word exists and belongs to the current teacher
    const word = await Word.findOne({
      where: {
        id: id,
        teacher_id: teacher_id,
      },
    });

    if (!word) {
      return res.status(403).json({
        msg: "You don't have permission to edit this word or it doesn't exist",
      });
    }

    // Update the word
    await word.update({
      english_word,
      translation_word,
    });

    // Fetch updated list
    const updatedWords = await Word.findAll({
      where: { student_id: word.student_id },
      include: [
        {
          model: User,
          as: "Teacher",
          attributes: ["id", "first_name", "last_name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      msg: "Word updated successfully",
      words: updatedWords,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ msg: "Error updating word", error });
  }
};
