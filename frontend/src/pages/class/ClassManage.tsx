import React, { useState, useEffect } from "react";
import { Button, Modal, Label, TextInput, Select } from "flowbite-react";
import {
  Card,
  Table,
  TableColumnsType,
  Button as AntButton,
  Space,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

interface Lesson {
  id: number;
  lesson_date: string;
  Student: { id: number; first_name: string; last_name: string };
  Teacher: { id: number; first_name: string; last_name: string };
  class_type: { id: number; name: string };
  pay_state: boolean;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
}

interface ClassType {
  id: number;
  name: string;
}

const ClassManage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/class/manage");
  const auth = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);
  const [payState, setPayState] = useState(false);

  const [classDate, setClassDate] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClassType, setSelectedClassType] = useState<string>("");

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null); // Store selected lesson for
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        fetchClasses();
      }
    }
  }, [permissions, navigate, loading_1]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const [lessonsRes, studentsRes, teachersRes, classTypesRes] =
        await Promise.all([
          api.get("/lessons"),
          api.get("/students"),
          api.get("/teachers"),
          api.get("/class-types"),
        ]);

      setLessons(lessonsRes.data || []);
      setStudents(studentsRes.data || []);
      setTeachers(teachersRes.data || []);
      setClassTypes(classTypesRes.data || []);

      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      handleApiError(error);
      setLoading(false);
    }
  };

  const createLesson = async () => {
    if (
      !classDate ||
      !selectedStudent ||
      !selectedTeacher ||
      !selectedClassType
    ) {
      toast.error("All fields are required.", { theme: "dark" });
      return;
    }

    try {
      const res = await api.post("/lessons", {
        class_date: classDate,
        student_id: selectedStudent,
        teacher_id: selectedTeacher,
        class_type_id: selectedClassType,
        pay_state: payState,
      });

      setLessons([...res.data.lessons]);

      // Reset form
      setClassDate("");
      setSelectedStudent("");
      setSelectedTeacher("");
      setSelectedClassType("");
      setPayState(false);
      setOpenModal(false);

      toast.success("Lesson added successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error creating lesson:", error);
      handleApiError(error);
    }
  };

  const deleteLesson = async (id: number) => {
    try {
      await api.delete(`/lessons/${id}`);
      setLessons((prevLessons) =>
        prevLessons.filter((lesson) => lesson.id !== id),
      );
      toast.success("Lesson deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error deleting lesson:", error);
      handleApiError(error);
    }
  };

  const openEditLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setClassDate(lesson.lesson_date);
    setSelectedStudent(lesson.Student.id.toString());
    setSelectedTeacher(lesson.Teacher.id.toString());
    setSelectedClassType(lesson.class_type.id.toString());
    setPayState(lesson.pay_state);
    setOpenEditModal(true);
  };

  const updateLesson = async () => {
    if (!selectedLesson) return;

    try {
      const res = await api.put(`/lessons/${selectedLesson.id}`, {
        class_date: classDate,
        student_id: selectedStudent,
        teacher_id: selectedTeacher,
        class_type_id: selectedClassType,
        pay_state: payState,
      });

      setLessons([...res.data.lessons]);

      setOpenEditModal(false);
      setSelectedLesson(null);
      toast.success("Lesson updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating lesson:", error);
      handleApiError(error);
    }
  };

  const handleApiError = (error: any) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.", { theme: "dark" });
        navigate("/");
      } else {
        toast.error("Failed to perform the action. Please try again.", {
          theme: "dark",
        });
      }
    } else {
      toast.error("Network error. Please check your connection.", {
        theme: "dark",
      });
    }
  };

  const downloadCSV = () => {
    if (lessons.length === 0) {
      toast.error("No class data available to download.", { theme: "dark" });
      return;
    }

    // Convert lessons data to CSV format
    const csvData = lessons.map((lesson) => ({
      "Class Date": lesson.lesson_date,
      "Student Name": `${lesson.Student.first_name} ${lesson.Student.last_name}`,
      "Teacher Name": `${lesson.Teacher.first_name} ${lesson.Teacher.last_name}`,
      "Class Type": lesson.class_type.name,
    }));

    // Convert to CSV string
    const csv = Papa.unparse(csvData);

    // Create a blob and trigger the download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "class_data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: TableColumnsType<any> = (
    [
      {
        title: "No",
        dataIndex: "index",
        key: "index",
        width: "8%",
        fixed: "left",
        render: (_: any, __: any, index: number) => (
          <span className=" font-medium text-gray-600 dark:text-gray-400">
            {index + 1}
          </span>
        ),
      },
      {
        title: "Date",
        dataIndex: "lesson_date",
        key: "lesson_date",
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
        sorter: (a: any, b: any) =>
          new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime(),
      },
      {
        title: "Student",
        dataIndex: "student_name",
        key: "student_name",
        fixed: "left",
        sorter: (a: any, b: any) =>
          a.student_name.localeCompare(b.student_name),
        filters:
          auth.user?.role !== "student"
            ? students
                .map((student) => ({
                  text: `${student.first_name} ${student.last_name}`,
                  value: `${student.first_name} ${student.last_name}`,
                }))
                .sort((a, b) => a.text.localeCompare(b.text))
            : undefined,
        onFilter: (value: any, record: any) =>
          record.student_name.includes(value),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
      {
        title: "Teacher",
        dataIndex: "teacher_name",
        key: "teacher_name",
        sorter: (a: any, b: any) =>
          a.teacher_name.localeCompare(b.teacher_name),
        filters:
          auth.user?.role !== "teacher"
            ? teachers
                .map((teacher) => ({
                  text: `${teacher.first_name} ${teacher.last_name}`,
                  value: `${teacher.first_name} ${teacher.last_name}`,
                }))
                .sort((a, b) => a.text.localeCompare(b.text))
            : undefined,
        onFilter: (value: any, record: any) =>
          record.teacher_name.includes(value),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
      {
        title: "Class Type",
        dataIndex: "class_type",
        key: "class_type",
        sorter: (a: any, b: any) => a.class_type.localeCompare(b.class_type),
        filters: classTypes.map((classType) => ({
          text: classType.name,
          value: classType.name,
        })),
        onFilter: (value: any, record: any) =>
          record.class_type.includes(value),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
    ] as TableColumnsType<any>
  ).concat(
    permissions.update || permissions.delete
      ? [
          {
            title: "Action",
            key: "action",
            render: (_: any, record: Lesson) => (
              <Space size="middle">
                {permissions.update && (
                  <AntButton
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditLesson(record)}
                    style={{ color: "white" }}
                  />
                )}
                {permissions.delete && (
                  <AntButton
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteLesson(record.id)}
                    style={{ color: "#ef4444" }}
                  />
                )}
              </Space>
            ),
          },
        ]
      : [],
  );

  const tableData = lessons
    .filter((lesson) => {
      if (auth.user?.role === "student") {
        return lesson.Student.id === parseInt(auth.user.id);
      }
      if (auth.user?.role === "teacher") {
        return lesson.Teacher.id === parseInt(auth.user.id);
      }
      return true;
    })
    .map((lesson, index) => ({
      key: index,
      id: lesson.id,
      lesson_date: lesson.lesson_date,
      student_name: `${lesson.Student.first_name} ${lesson.Student.last_name}`,
      teacher_name: `${lesson.Teacher.first_name} ${lesson.Teacher.last_name}`,
      class_type: lesson.class_type.name,
      Student: lesson.Student,
      Teacher: lesson.Teacher,
      ClassType: lesson.class_type,
    }));

  if (loading_1) {
    return <LoadingSpinner></LoadingSpinner>;
  }
  const cardStyles = {
    header: {
      background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
      borderRadius: "12px 12px 0 0",
      padding: "12px 16px", // Reduced padding for mobile
      border: "none",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      "@media (min-width: 640px)": {
        padding: "16px 24px",
      },
    },
    body: {
      padding: "10px", // Reduced padding for mobile
      borderRadius: "0 0 12px 12px",
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      height: "110vh", // Changed from fixed height
      maxHeight: "100vh",
      "@media (min-width: 640px)": {
        padding: "20px",
      },
    },
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex h-[84vh] w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
    >
      <Card
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">
              Class Manage
            </span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
        extra={
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
            <div className="xs:flex-row flex flex-col gap-2">
              {permissions.create && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() => setOpenModal(true)}
                >
                  <PlusOutlined className="mr-2" />
                  Add Class
                </motion.button>
              )}
              {permissions.download && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  onClick={downloadCSV}
                >
                  <DownloadOutlined className="mr-2" />
                  Download CSV
                </motion.button>
              )}
            </div>
          </div>
        }
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          <Table
            style={{ width: "100%" }}
            columns={columns}
            dataSource={tableData}
            pagination={false}
            loading={{
              spinning: loading,
              size: "large",
            }}
            scroll={{ x: "max-content", y: "calc(65vh - 200px)" }}
            size="large"
            className="custom-table"
          />
        </div>
      </Card>

      {/* Add Class Modal */}
      {permissions.create && (
        <Modal
          show={openModal}
          size="md"
          onClose={() => setOpenModal(false)}
          popup
          className="responsive-modal"
        >
          <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
          <Modal.Body>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Add Class
              </h3>

              <div>
                <Label htmlFor="class_date" value="Class Date" />
                <TextInput
                  id="lesson_date"
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>

              <div>
                <Label htmlFor="student" value="Student" />
                <Select
                  id="student"
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Student</option>
                  {students
                    ?.sort((a, b) =>
                      `${a.first_name} ${a.last_name}`.localeCompare(
                        `${b.first_name} ${b.last_name}`,
                      ),
                    )
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="teacher" value="Teacher" />
                <Select
                  id="teacher"
                  required
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Teacher</option>
                  {teachers
                    .sort((a, b) =>
                      `${a.first_name} ${a.last_name}`.localeCompare(
                        `${b.first_name} ${b.last_name}`,
                      ),
                    )
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="classType" value="Class Type" />
                <Select
                  id="classType"
                  required
                  value={selectedClassType}
                  onChange={(e) => setSelectedClassType(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((classType) => (
                    <option key={classType.id} value={classType.id}>
                      {classType.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={createLesson}
                >
                  Add Class
                </Button>
                <Button
                  className="xs:w-auto w-full"
                  color="gray"
                  onClick={() => setOpenModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Edit Class Modal */}
      {permissions.update && (
        <Modal
          show={openEditModal}
          size="md"
          onClose={() => setOpenEditModal(false)}
          popup
          className="responsive-modal"
        >
          <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
          <Modal.Body>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Edit Class
              </h3>

              <div>
                <Label htmlFor="edit_class_date" value="Class Date" />
                <TextInput
                  id="edit_class_date"
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>

              <div>
                <Label htmlFor="edit_student" value="Student" />
                <Select
                  id="edit_student"
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Student</option>
                  {students
                    ?.sort((a, b) =>
                      `${a.first_name} ${a.last_name}`.localeCompare(
                        `${b.first_name} ${b.last_name}`,
                      ),
                    )
                    .map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_teacher" value="Teacher" />
                <Select
                  id="edit_teacher"
                  required
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Teacher</option>
                  {teachers
                    .sort((a, b) =>
                      `${a.first_name} ${a.last_name}`.localeCompare(
                        `${b.first_name} ${b.last_name}`,
                      ),
                    )
                    .map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name}
                      </option>
                    ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_classType" value="Class Type" />
                <Select
                  id="edit_classType"
                  required
                  value={selectedClassType}
                  onChange={(e) => setSelectedClassType(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((classType) => (
                    <option key={classType.id} value={classType.id}>
                      {classType.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={updateLesson}
                >
                  Update Class
                </Button>
                <Button
                  className="xs:w-auto w-full"
                  color="gray"
                  onClick={() => setOpenEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </motion.div>
  );
};

export default ClassManage;
