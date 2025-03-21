import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Label, TextInput, Select } from "flowbite-react";
import { Table, TableColumnsType, Button as AntButton, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

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
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Date",
        dataIndex: "lesson_date",
        key: "lesson_date",
        render: (text: string) => text,
        sorter: (a: any, b: any) =>
          new Date(a.lesson_date).getTime() - new Date(b.lesson_date).getTime(),
      },
      {
        title: "Student",
        dataIndex: "student_name",
        key: "student_name",
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

  return (
    <Card className="max-h-[80vh] overflow-auto">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        {permissions.create && (
          <button
            className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            type="button"
            onClick={() => setOpenModal(true)}
          >
            + Add Class
          </button>
        )}
        {permissions.download && (
          <button
            onClick={downloadCSV}
            className="mb-3 ml-2 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
          >
            📥 Download CSV
          </button>
        )}

        <Table
          style={{ width: "70vw" }}
          columns={columns}
          dataSource={tableData}
          pagination={false}
          loading={{
            spinning: loading,
            size: "large",
          }}
          className="custom-table"
          scroll={{ y: "50vh" }}
          sticky
        />
      </div>

      {/* Add Class Modal */}
      {permissions.create && (
        <Modal
          show={openModal}
          size="md"
          onClose={() => setOpenModal(false)}
          popup
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
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
                />
              </div>

              <div>
                <Label htmlFor="student" value="Student" />
                <Select
                  id="student"
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
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
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((classType) => (
                    <option key={classType.id} value={classType.id}>
                      {classType.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-auto">
                <Button className="flex-none" onClick={createLesson}>
                  Add
                </Button>
                <Button
                  className="ml-2 flex-none"
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
        >
          <Modal.Header />
          <Modal.Body>
            <div className="space-y-6">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Edit Class
              </h3>

              <div>
                <Label htmlFor="class_date" value="Class Date" />
                <TextInput
                  id="class_date"
                  type="date"
                  required
                  value={classDate}
                  onChange={(e) => setClassDate(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="student" value="Student" />
                <Select
                  id="student"
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
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
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((classType) => (
                    <option key={classType.id} value={classType.id}>
                      {classType.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex flex-auto">
                <Button className="flex-none" onClick={updateLesson}>
                  Update
                </Button>
                <Button
                  className="ml-2 flex-none"
                  onClick={() => setOpenEditModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}
    </Card>
  );
};

export default ClassManage;
