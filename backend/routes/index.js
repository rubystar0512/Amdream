const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController");
const studentController = require("../controllers/studentController");
const teacherController = require("../controllers/teacherController");
const classTypeController = require("../controllers/classTypeController");
const lessonController = require("../controllers/lessonController");
const dashboardController = require("../controllers/dashboardController");
const paymentController = require("../controllers/paymentController");

const userController = require("../controllers/userController");
const wordController = require("../controllers/wordController");
const classInfoController = require("../controllers/classInfoController");
const calendarController = require("../controllers/calendarController");

router.post("/auth/login", authController.login);
router.post("/auth/signup", authController.signup);
router.post("/auth/forgot-password", authController.forgotPassword);
router.post("/auth/reset-password", authController.resetPassword);

// Student Routes
router.get("/students", authMiddleware, studentController.getAllStudents);
router.post("/students", authMiddleware, studentController.createStudent);
router.put("/students/:id", authMiddleware, studentController.updateStudent);
router.delete("/students/:id", authMiddleware, studentController.deleteStudent);

// Teacher Routes
router.get("/teachers", authMiddleware, teacherController.getAllTeachers);
router.post("/teachers", authMiddleware, teacherController.createTeacher);
router.put("/teachers/:id", authMiddleware, teacherController.updateTeacher);
router.delete("/teachers/:id", authMiddleware, teacherController.deleteTeacher);
router.post(
  "/teachers/:id/rates",
  authMiddleware,
  teacherController.setTeacherRates
);
router.get(
  "/teachers/:teacherId/students",
  authMiddleware,
  teacherController.getTeacherStudents
);

//ClassType Routes
router.get(
  "/class-types",
  authMiddleware,
  classTypeController.getAllClassTypes
);
router.post(
  "/class-types",
  authMiddleware,
  classTypeController.createClassType
);
router.put(
  "/class-types/:id",
  authMiddleware,
  classTypeController.updateClassType
);
router.delete(
  "/class-types/:id",
  authMiddleware,
  classTypeController.deleteClassType
);

//Lesson Routes

router.get("/lessons", authMiddleware, lessonController.getAllLessons);
router.get("/lessons/:id", authMiddleware, lessonController.getLessonById);
router.post("/lessons", authMiddleware, lessonController.createLesson);
router.put("/lessons/:id", authMiddleware, lessonController.updateLesson);
router.delete("/lessons/:id", authMiddleware, lessonController.deleteLesson);

//Dashboard Routes

router.get(
  "/students/class-stats",
  authMiddleware,
  dashboardController.classState
);
router.post("/teachers/salary", dashboardController.teachSalary);

router.put("/teachers/:id/salary", dashboardController.teachEachSalary);
router.get("/students/:id/class-stats", dashboardController.classEachState);

router.get("/payments", authMiddleware, paymentController.getAllPayments);
router.get(
  "/payments/student/:id",
  authMiddleware,
  paymentController.getPaymentById
);
router.post("/payments", authMiddleware, paymentController.createPayment);
router.put("/payments/:id", authMiddleware, paymentController.updatePayment);
router.delete("/payments/:id", authMiddleware, paymentController.deletePayment);

router.get("/getMenus", userController.getUserPermissions);

// User Management Routes
router.get("/users", authMiddleware, userController.getAllUsers);
router.delete("/users/:id", authMiddleware, userController.deleteUser);
router.put("/users/:id/role", userController.updateUserRole);

router.put("/users/:id/email", userController.updateUserEmail);
router.put("/users/:id/password", userController.updateUserPassword);

router.put("/users/:id/status", userController.updateUserStatus);

// Role Management Routes
router.get("/roles", userController.getRoles);
router.post("/roles", authMiddleware, userController.createRole);
router.put(
  "/roles/:role_id/permissions",
  authMiddleware,
  userController.updateRolePermissions
);

router.get("/permissions", authMiddleware, userController.getPermissions);
router.post("/permissions", authMiddleware, userController.createPermission);
router.put("/permissions/:id", authMiddleware, userController.updatePermission);
router.get("/menus", userController.getMenus);

// Word Routes
router.get("/words/:studentId", authMiddleware, wordController.getAllWords);
router.post("/words", authMiddleware, wordController.createWord);
router.put("/words/:id", authMiddleware, wordController.updateWord);
// Class Info Routes
router.get(
  "/class-info/:studentId",
  authMiddleware,
  classInfoController.getAllClassInfo
);
router.post("/class-info", authMiddleware, classInfoController.createClassInfo);
router.put(
  "/class-info/:id",
  authMiddleware,
  classInfoController.updateClassInfo
);

router.get("/calendar/events", calendarController.getAllEvents);
router.post("/calendar/events", calendarController.saveEvents);

router.get("/calendar/timerange/:id", calendarController.getTimeranges);
router.get("/calendar/timerange", calendarController.getAllTimeranges);
router.post("/calendar/timerange", calendarController.addTimerange);
router.delete("/calendar/timerange/:id", calendarController.deleteTimerange);

module.exports = router;
