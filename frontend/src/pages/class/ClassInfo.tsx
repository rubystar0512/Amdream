import React, { useState, useEffect } from "react";
import { Button, Modal, Label, TextInput, Textarea } from "flowbite-react";
import { Card, Table, TableColumnsType } from "antd";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";
import { motion } from "framer-motion";

import { Button as AntButton } from "antd";
import { EditOutlined } from "@ant-design/icons";

interface ClassInfo {
  id: number;
  date: string;
  course: string;
  unit: string;
  can_do: string;
  notes: string;
  student_id: number;
  teacher_id: number;
  Teacher: {
    id: number;
    first_name: string;
    last_name: string;
  };
}

const ClassInfo: React.FC<{ studentId: string; studentName: string }> = ({
  studentId,
  studentName,
}) => {
  const navigate = useNavigate();
  const { permissions, loading_1: permissionsLoading } =
    usePermissions("/class/info");
  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const { user } = useAuth();

  // Form states
  const [course, setCourse] = useState("");
  const [unit, setUnit] = useState("");
  const [canDo, setCanDo] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ClassInfo | null>(null);

  useEffect(() => {
    if (!permissionsLoading) {
      if (user?.role != "teacher") {
        if (!permissions.read) {
          navigate("/login");
          toast.error("You don't have permission to view this page", {
            theme: "dark",
          });
        } else {
          if (user?.role === "student") {
            fetchClassInfo(user.id);
          }
        }
      }
    }
  }, [permissions, navigate, permissionsLoading, user]);

  // Fetch class info when student is selected

  useEffect(() => {
    if (studentId != "") setSelectedStudent(studentId);
  }, [studentId, studentName]);

  useEffect(() => {
    if (selectedStudent) {
      fetchClassInfo(selectedStudent);
    } else {
      setClassInfos([]);
    }
  }, [selectedStudent]);

  // const fetchStudents = async () => {
  //   try {
  //     const response = await api.get(`/teachers/${user?.id}/students`);
  //     setStudents(response.data || []);
  //   } catch (error: any) {
  //     console.error("Error fetching students:", error);
  //     handleApiError(error);
  //   }
  // };

  const fetchClassInfo = async (studentId: string) => {
    try {
      setLoading(true);
      const url = `/class-info/${studentId}`;

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

  const handleEdit = (record: ClassInfo) => {
    setEditingRecord(record);
    setCourse(record.course);
    setUnit(record.unit);
    setCanDo(record.can_do);
    setNotes(record.notes || "");
    setDate(moment(record.date).format("YYYY-MM-DD"));
    setOpenModal(true);
    setIsEditing(true);
  };

  const updateClassInfo = async () => {
    if (!course || !unit || !canDo || !date) {
      toast.error("Please fill in all required fields.", { theme: "dark" });
      return;
    }

    try {
      const response = await api.put(`/class-info/${editingRecord?.id}`, {
        date,
        course,
        unit,
        can_do: canDo,
        notes,
        teacher_id: user?.id,
      });

      setClassInfos(response.data.classInfo);
      resetForm();
      setOpenModal(false);
      setIsEditing(false);
      toast.success("Class info updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating class info:", error);
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

  const columns: TableColumnsType<ClassInfo> = (
    [
      {
        title: "Date",
        dataIndex: "date",
        key: "date",
        sorter: (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime(),
        render: (text: string) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {moment(text).format("DD/MM/YYYY")}
            </span>
          );
        },
      },
      {
        title: "Teacher",
        dataIndex: "Teacher",
        fixed: "left",
        key: "Teacher",
        render: (obj: any) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {obj.first_name + " " + obj.last_name}
            </span>
          );
        },
      },
      {
        title: "Course",
        dataIndex: "course",
        key: "course",

        sorter: (a, b) => a.course.localeCompare(b.course),
        render: (obj: any) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {obj}
            </span>
          );
        },
      },
      {
        title: "Unit",
        dataIndex: "unit",
        key: "unit",

        sorter: (a, b) => a.unit.localeCompare(b.unit),
        render: (obj: any) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {obj}
            </span>
          );
        },
      },
      {
        title: "Can-do",
        dataIndex: "can_do",
        key: "can_do",
        render: (obj: any) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {obj}
            </span>
          );
        },
      },
      {
        title: "Notes",
        dataIndex: "notes",
        key: "notes",
        render: (obj: any) => {
          return (
            <span className="font-medium text-gray-900 dark:text-white">
              {obj}
            </span>
          );
        },
      },
    ] as TableColumnsType<ClassInfo>
  ).concat(
    user?.role === "teacher"
      ? [
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => {
              if (user?.id === record?.Teacher?.id) {
                return (
                  <AntButton
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEdit(record)}
                  />
                );
              }
              return null;
            },
          },
        ]
      : [],
  );

  if (permissionsLoading) {
    return <LoadingSpinner />;
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
      height: "auto", // Changed from fixed height
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
      className="z-0 flex h-auto w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
    >
      <Card
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">Class</span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
        extra={
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
            {user?.role === "teacher" && (
              <div className="flex flex-col gap-2 xs:flex-row">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium ${
                    !selectedStudent
                      ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : "bg-gradient-to-r from-blue-900 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => setOpenModal(true)}
                  disabled={!selectedStudent}
                >
                  + Add Class Info
                </motion.button>
              </div>
            )}
          </div>
        }
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          <Table
            style={{ width: "100%" }}
            columns={columns}
            dataSource={classInfos}
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

      {/* Add/Edit Class Info Modal */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => {
          setOpenModal(false);
          setIsEditing(false);
          resetForm();
        }}
        popup
        style={{ zIndex: "1000" }}
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
        <Modal.Body>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              {isEditing ? "Edit class info" : "Add new class info"}
            </h3>

            <div>
              <Label htmlFor="date" value="Date:" />
              <TextInput
                id="date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg"
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
                className="w-full rounded-lg"
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
                className="w-full rounded-lg"
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
                className="w-full rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="notes" value="Notes:" />
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2 pt-4 xs:flex-row">
              <Button
                className="w-full xs:w-auto"
                gradientDuoTone="purpleToBlue"
                onClick={isEditing ? updateClassInfo : addNewClassInfo}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
              <Button
                className="w-full xs:w-auto"
                color="gray"
                onClick={() => {
                  setOpenModal(false);
                  setIsEditing(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default ClassInfo;
