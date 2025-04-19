import React, { useEffect, useState } from "react";
import { Card, Table, TableColumnsType } from "antd";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";
import { motion } from "framer-motion";
import AddEditClassModal from "./AddEditClassModal";
import { Button as AntButton } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useClassModal } from "../../contexts/ClassModalContext";

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
  const { user } = useAuth();
  const [classInfos, setClassInfos] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<string>("");

  const {
    formData,
    isEditing,
    openModal,
    closeModal,
    resetForm,
    editingRecord,
    setEditingRecord,
  } = useClassModal();

  useEffect(() => {
    if (!permissionsLoading) {
      if (user?.role !== "teacher" && !permissions.read) {
        navigate("/login");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else if (user?.role === "student") {
        fetchClassInfo(user.id);
      }
    }
  }, [permissionsLoading, permissions, navigate, user]);

  useEffect(() => {
    if (studentId) setSelectedStudent(studentId);
  }, [studentId, studentName]);

  useEffect(() => {
    if (selectedStudent) fetchClassInfo(selectedStudent);
    else setClassInfos([]);
  }, [selectedStudent]);

  const fetchClassInfo = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/class-info/${studentId}`);
      setClassInfos(response.data || []);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setLoading(false);
    }
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

  const handleAdd = () => {
    openModal(
      {
        date: "",
        course: "",
        unit: "",
        canDo: "",
        notes: "",
      },
      false,
    );
  };

  const handleEdit = (record: ClassInfo) => {
    openModal(
      {
        date: moment(record.date).format("YYYY-MM-DD"),
        course: record.course,
        unit: record.unit,
        canDo: record.can_do,
        notes: record.notes || "",
      },
      true,
    );
    setEditingRecord(record);
  };

  const handleSubmit = async () => {
    const { date, course, unit, canDo, notes } = formData;

    if (!date || !course || !unit || !canDo || !selectedStudent) {
      toast.error("Please fill in all required fields.", { theme: "dark" });
      return;
    }

    try {
      if (isEditing && editingRecord) {
        const response = await api.put(`/class-info/${editingRecord.id}`, {
          date,
          course,
          unit,
          can_do: canDo,
          notes,
          teacher_id: user?.id,
        });
        setClassInfos(response.data.classInfo);
        toast.success("Class info updated successfully!", { theme: "dark" });
      } else {
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
        toast.success("Class info added successfully!", { theme: "dark" });
      }
    } catch (error: any) {
      handleApiError(error);
    } finally {
      closeModal();
      resetForm();
    }
  };

  const columns: TableColumnsType<ClassInfo> = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (text: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {moment(text).format("DD/MM/YYYY")}
        </span>
      ),
    },
    {
      title: "Teacher",
      dataIndex: "Teacher",
      key: "Teacher",
      render: (obj) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {obj.first_name} {obj.last_name}
        </span>
      ),
    },
    {
      title: "Course",
      dataIndex: "course",
      key: "course",
      sorter: (a, b) => a.course.localeCompare(b.course),
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
      sorter: (a, b) => a.unit.localeCompare(b.unit),
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      title: "Can-do",
      dataIndex: "can_do",
      key: "can_do",
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    {
      title: "Notes",
      dataIndex: "notes",
      key: "notes",
      render: (val) => (
        <span className="font-medium text-gray-900 dark:text-white">{val}</span>
      ),
    },
    ...(user?.role === "teacher"
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
      : []),
  ];

  return permissionsLoading || loading ? (
    <LoadingSpinner />
  ) : (
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
        headStyle={{
          background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          borderRadius: "12px 12px 0 0",
          padding: "12px 16px",
        }}
        bodyStyle={{
          padding: "10px",
          borderRadius: "0 0 12px 12px",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          height: "auto",
          maxHeight: "100vh",
        }}
        extra={
          user?.role === "teacher" && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium ${
                !selectedStudent
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                  : "bg-gradient-to-r from-blue-900 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={handleAdd}
              disabled={!selectedStudent}
            >
              + Add Class Info
            </motion.button>
          )
        }
      >
        <Table
          style={{ width: "100%" }}
          columns={columns}
          dataSource={classInfos}
          pagination={false}
          loading={loading}
          scroll={{ x: "max-content", y: "calc(65vh - 200px)" }}
          size="large"
          className="custom-table"
        />
      </Card>

      <AddEditClassModal onSubmit={handleSubmit} />
    </motion.div>
  );
};

export default ClassInfo;
