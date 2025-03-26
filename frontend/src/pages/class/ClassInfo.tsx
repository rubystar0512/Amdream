import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Label,
  TextInput,
  Textarea,
  Select,
} from "flowbite-react";
import { Table, TableColumnsType } from "antd";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";

interface ClassInfo {
  id: number;
  date: string;
  course: string;
  unit: string;
  can_do: string;
  notes: string;
  student_id: number;
  teacher_id: number;
}

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  class_count: number;
}

const ClassInfo: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, loading_1: permissionsLoading } =
    usePermissions("/class/info");
  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const { user } = useAuth();

  // Form states
  const [course, setCourse] = useState("");
  const [unit, setUnit] = useState("");
  const [canDo, setCanDo] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (!permissionsLoading) {
      if (!permissions.read) {
        navigate("/login");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        if (user?.role === "teacher") {
          fetchStudents();
        } else if (user?.role === "student") {
          fetchClassInfo(user.id);
        }
      }
    }
  }, [permissions, navigate, permissionsLoading, user]);

  // Fetch class info when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchClassInfo(selectedStudent);
    } else {
      setClassInfos([]);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/teachers/${user?.id}/students`);
      setStudents(response.data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      handleApiError(error);
    }
  };

  const fetchClassInfo = async (studentId: string) => {
    try {
      setLoading(true);
      const url =
        user?.role === "teacher"
          ? `/class-info/${studentId}?teacher_id=${user.id}`
          : `/class-info/${studentId}`;

      const response = await api.get(url);
      setClassInfos(response.data || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching class info:", error);
      handleApiError(error);
      setLoading(false);
    }
  };

  const addNewClassInfo = async () => {
    if (!course || !unit || !canDo || !date || !selectedStudent) {
      toast.error("Please fill in all required fields.", { theme: "dark" });
      return;
    }

    try {
      const response = await api.post("/class-info", {
        date,
        course,
        unit,
        can_do: canDo,
        notes,
        student_id: selectedStudent,
        teacher_id: user?.id,
      });

      setClassInfos([...response.data.classInfo]);
      resetForm();
      setOpenModal(false);
      toast.success("Class info added successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error adding class info:", error);
      handleApiError(error);
    }
  };

  const resetForm = () => {
    setCourse("");
    setUnit("");
    setCanDo("");
    setNotes("");
    setDate("");
  };

  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.", { theme: "dark" });
      navigate("/");
    } else {
      toast.error("An error occurred. Please try again.", { theme: "dark" });
    }
  };

  const columns: TableColumnsType<ClassInfo> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (text: string) => {
        return moment(text).format("DD/MM/YYYY");
      },
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      sorter: (a, b) => a.course.localeCompare(b.course),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      sorter: (a, b) => a.unit.localeCompare(b.unit),
    },
    {
      title: "Can-do",
      dataIndex: "can_do",
      key: "can_do",
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
    },
  ];

  if (permissionsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="max-h-[80vh] w-[78vw] overflow-auto">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <div className="mb-4 flex items-center gap-4">
          {user?.role === "teacher" && (
            <>
              <div className="w-64">
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

              {permissions.create && (
                <button
                  className={`inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium ${
                    !selectedStudent
                      ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : "bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                  } focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:focus:ring-gray-700`}
                  type="button"
                  onClick={() => setOpenModal(true)}
                  disabled={!selectedStudent}
                >
                  Add new class info
                </button>
              )}
            </>
          )}
        </div>

        {
          <Table
            columns={columns}
            dataSource={classInfos}
            pagination={false}
            loading={loading}
            className="custom-table"
            scroll={{ y: "50vh" }}
            sticky
          />
        }
      </div>

      {/* Add Class Info Modal */}
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
              Add new class info
            </h3>

            <div>
              <Label htmlFor="date" value="Date:" />
              <TextInput
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="course" value="Course:" />
              <TextInput
                id="course"
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="unit" value="Unit:" />
              <TextInput
                id="unit"
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="can-do" value="Can-do:" />
              <TextInput
                id="can-do"
                type="text"
                required
                value={canDo}
                onChange={(e) => setCanDo(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="notes" value="Notes:" />
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex flex-auto">
              <Button className="flex-none" onClick={addNewClassInfo}>
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
    </Card>
  );
};

export default ClassInfo;
