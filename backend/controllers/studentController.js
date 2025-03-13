const moment = require("moment");
const bcrypt = require("bcryptjs");
const { User, StudentInfo } = require("../models");
const { user_role } = require("../configs/key");

/**
 * @desc Get all students
 * @route GET /api/students
 */
exports.getAllStudents = async (req, res) => {
  try {
    const students = await User.findAll({
      where: { role_id: user_role.student },
      include: { model: StudentInfo, attributes: ["note"] },
    });

    const transformedStudents = students.map((student) => ({
      ...student.get(),
      note: student.student_infos[0]?.note || null,
      student_infos: undefined,
    }));
    res.status(200).json(transformedStudents);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching students", error });
  }
};

/**
 * @desc Get student by ID
 * @route GET /api/students/:id
 */
exports.getStudentById = async (req, res) => {
  try {
    const student = await User.findOne({
      where: { id: req.params.id, role_id: user_role.student },
      include: { model: StudentInfo, attributes: ["note"] },
    });
    if (!student) return res.status(404).json({ msg: "Student not found" });

    res.status(200).json({
      ...student.get(),
      note: student.student_infos[0]?.note || null,
      student_infos: undefined,
    });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching student", error });
  }
};

/**
 * @desc Create a student
 * @route POST /api/students
 */
exports.createStudent = async (req, res) => {
  try {
    const { first_name, last_name, note, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newStudent = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role_id: user_role.student,
    });

    const studentInfo = await StudentInfo.create({
      student_id: newStudent.id,
      note,
    });

    res.status(201).json({
      msg: "Student created successfully",
      student: {
        ...newStudent.get(),
        note: studentInfo.note,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error creating student", error });
  }
};

/**
 * @desc Update student
 * @route PUT /api/students/:id
 */
exports.updateStudent = async (req, res) => {
  try {
    const { first_name, last_name, note, email, password } = req.body;
    const student = await User.findOne({
      where: { id: req.params.id, role_id: user_role.student },
    });

    if (!student) return res.status(404).json({ msg: "Student not found" });
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await student.update({
        first_name,
        last_name,
        email,
        password: hashedPassword,
      });
    } else {
      await student.update({ first_name, last_name, email });
    }
    await StudentInfo.update({ note }, { where: { student_id: student.id } });
    res.status(200).json({
      msg: "Student updated successfully",
      student: {
        ...student.get(),
        note,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Error updating student", error });
  }
};

/**
 * @desc Delete student
 * @route DELETE /api/students/:id
 */
exports.deleteStudent = async (req, res) => {
  try {
    const student = await User.findOne({
      where: { id: req.params.id, role_id: user_role.student },
    });

    if (!student) return res.status(404).json({ msg: "Student not found" });

    await student.destroy();

    res.status(200).json({ msg: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting student", error });
  }
};

exports.dailyReport = async () => {
  try {
    const students = await User.findAll({
      where: { role_id: user_role.student },
      include: { model: StudentInfo, attributes: ["note"] },
    });

    return students.map((student, key) => ({
      id: key + 1,
      full_name: `${student.first_name} ${student.last_name}`,
      note: student.student_infos[0]?.note || null,
      created_at: moment(student.createdAt).format("DD/MM/YYYY"),
      updated_at: moment(student.updatedAt).format("DD/MM/YYYY"),
    }));
  } catch (error) {
    console.log("Error fetching students", error);
  }
};
