import { useState, useEffect } from "react";
import { Button, Label, Modal, TextInput, Textarea } from "flowbite-react";
import {
  Table,
  TableColumnsType,
  Button as AntButton,
  Space,
  Drawer,
  Card,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import { motion } from "framer-motion";

import ClassInfo from "../class/ClassInfo";
import Words from "../class/Words";

export default function Students() {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/users/students");
  const [studentData, setStudentData] = useState<any[]>([]);
  const [eachFirstName, setFirstName] = useState("");
  const [eachLastName, setLastName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null); // Store selected student for editing
  const [note, setNote] = useState(""); // Add note state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [specifiedStudentData, setSpecifiedStudentData] = useState<any[]>([]);
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );

  const [selectedName, setSelectedName] = useState<string | null>(null);

  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        if (user?.role === "teacher") {
          fetchSpecifiedStudents();
        } else {
          fetchStudents();
        }
      }
    }
  }, [permissions, navigate, loading_1]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/students");
      setStudentData(res.data || []);
      setLoading(false);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const fetchSpecifiedStudents = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/teachers/${user?.id}/students`);
      setSpecifiedStudentData(res.data || []);
      setLoading(false);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleApiError = (error: any) => {
    console.error("API Error:", error);
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.", { theme: "dark" });
      navigate("/");
    } else {
      toast.error("An error occurred. Please try again.", { theme: "dark" });
    }
  };

  const createData = async () => {
    if (!eachFirstName || !eachLastName || !email || !password) {
      toast.error("First Name, Last Name, Email and Password are required.", {
        theme: "dark",
      });
      return;
    }

    try {
      const res = await api.post("/students", {
        first_name: eachFirstName,
        last_name: eachLastName,
        email: email,
        password: password,
        note: note,
      });

      setStudentData((prevData) => [...prevData, res?.data?.student]);

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setNote("");
      setOpenModal(false);

      toast.success("Student added successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const deleteEachData = async (id: string) => {
    try {
      await api.delete(`/students/${id}`);
      setStudentData((prevData) =>
        prevData.filter((student) => student.id !== id),
      );
      toast.success("Student deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const openEditStudent = (student: any) => {
    setSelectedStudent(student);
    setFirstName(student.first_name);
    setLastName(student.last_name);
    setEmail(student.email);
    setPassword(""); // Reset password field
    setNote(student.note || "");
    setOpenEditModal(true);
  };

  const updateStudent = async () => {
    if (!selectedStudent) return;

    try {
      const updateData: any = {
        first_name: eachFirstName,
        last_name: eachLastName,
        email: email,
        note: note,
      };

      // Only include password if it's been changed
      if (password) {
        updateData.password = password;
      }

      const res = await api.put(`/students/${selectedStudent.id}`, updateData);

      // Update the student data by replacing the old student with the updated one
      setStudentData((prevData) =>
        prevData.map((student) =>
          student.id === selectedStudent.id ? res.data.student : student,
        ),
      );

      setOpenEditModal(false);
      setSelectedStudent(null);
      setEmail("");
      setPassword("");
      setNote("");
      toast.success("Student updated successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const columns: TableColumnsType<any> = (
    [
      {
        title: "No",
        dataIndex: "index",
        key: "index",
        width: "5%",
        fixed: "left",
        render: (_: any, __: any, index: number) => (
          <span className="text-gray-600 dark:text-gray-400">{index + 1}</span>
        ),
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        width: "15%",
        fixed: "left",
        sorter: (a: any, b: any) => a.first_name.localeCompare(b.first_name),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        width: "15%",
        fixed: "left",
        sorter: (a: any, b: any) => a.last_name.localeCompare(b.last_name),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        width: "20%",
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
        render: (text: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {text}
          </span>
        ),
      },
      {
        title: "Note",
        dataIndex: "note",
        key: "note",
        width: "25%",
        render: (_: any, record: any) => (
          <div className="text-center">
            <span className="font-medium text-gray-900 dark:text-white">
              {record?.note}
            </span>
          </div>
        ),
      },
    ] as TableColumnsType<any>
  ).concat(
    permissions.update || permissions.delete
      ? [
          {
            title: "Action",
            key: "action",
            width: "20%",
            render: (_: any, record: any) => (
              <Space size="middle">
                {permissions.update && (
                  <AntButton
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditStudent(record)}
                    style={{ color: "white" }}
                  />
                )}
                {permissions.delete && (
                  <AntButton
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteEachData(record.id)}
                    style={{ color: "#ef4444" }}
                  />
                )}
              </Space>
            ),
          },
        ]
      : [],
  );

  const simpleColumns: TableColumnsType<any> = [
    {
      title: "Student name",
      key: "name",
      fixed: "left",
      render: (_, record) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {record.first_name} {record.last_name}
        </span>
      ),
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`,
        ),
    },
    {
      title: "Number of classes",
      dataIndex: "class_count",
      key: "class_count",
      fixed: "left",
      sorter: (a, b) => a.class_count - b.class_count,
      render: (value: number) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {value}
        </span>
      ),
    },
  ];

  if (loading_1) {
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
      className="z-100 flex h-[84vh] w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
    >
      <Card
        title={
          <div className="z-150 flex items-center gap-3">
            <span className="text-lg font-semibold text-white">Students</span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
        extra={
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
            {user?.role !== "teacher" && permissions.create && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => {
                  setOpenModal(true);
                  setFirstName("");
                  setLastName("");
                  setEmail("");
                  setPassword("");
                  setNote("");
                }}
              >
                + Add Student
              </motion.button>
            )}
          </div>
        }
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          {user?.role === "teacher" ? (
            <>
              <Table
                className="custom-table"
                columns={simpleColumns}
                dataSource={specifiedStudentData}
                loading={{
                  spinning: loading,
                  size: "large",
                }}
                pagination={false}
                scroll={{ x: "max-content", y: "calc(84vh - 200px)" }}
                size="large"
                onRow={(record) => ({
                  onClick: () => {
                    setSelectedStudentId(record.id);
                    setOpenDrawer(true);
                    setSelectedName(record.first_name + " " + record.last_name);
                  },
                  style: { cursor: "pointer" },
                })}
              />
              <Drawer
                title={
                  <span className="text-lg font-semibold">
                    Details of {selectedName}
                  </span>
                }
                placement="right"
                onClose={() => setOpenDrawer(false)}
                open={openDrawer}
                width={window.innerWidth > 768 ? "80vw" : "100vw"}
                className="custom-drawer"
              >
                <div className="flex flex-col gap-4">
                  <ClassInfo
                    studentId={selectedStudentId || ""}
                    studentName={selectedName || ""}
                  />
                  <Words
                    studentId={selectedStudentId || ""}
                    studentName={selectedName || ""}
                  />
                </div>
              </Drawer>
            </>
          ) : (
            <Table
              className="custom-table"
              columns={columns}
              dataSource={studentData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              loading={{
                spinning: loading,
                size: "large",
              }}
              pagination={false}
              scroll={{ x: "max-content", y: "calc(84vh - 200px)" }}
              size="large"
            />
          )}
        </div>
      </Card>

      {/* Add Student Modal */}
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
              Add Student
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="first_name" value="First Name" />
                <TextInput
                  id="first_name"
                  placeholder="Jack"
                  required
                  value={eachFirstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="last_name" value="Last Name" />
                <TextInput
                  id="last_name"
                  placeholder="Smith"
                  required
                  value={eachLastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="email" value="Email" />
                <TextInput
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
              <div>
                <Label htmlFor="password" value="Password" />
                <TextInput
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="note" value="Note" />
              <Textarea
                id="note"
                placeholder="Add notes about the student..."
                rows={4}
                className="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>

            <div className="xs:flex-row flex flex-col gap-2 pt-4">
              <Button
                className="xs:w-auto w-full"
                gradientDuoTone="purpleToBlue"
                onClick={createData}
              >
                Add Student
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

      {/* Edit Student Modal */}
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
                Edit Student
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit_first_name" value="First Name" />
                  <TextInput
                    id="edit_first_name"
                    required
                    value={eachFirstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <Label htmlFor="edit_last_name" value="Last Name" />
                  <TextInput
                    id="edit_last_name"
                    required
                    value={eachLastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="edit_email" value="Email" />
                  <TextInput
                    id="edit_email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="edit_password"
                    value="New Password (optional)"
                  />
                  <TextInput
                    id="edit_password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current password"
                    className="w-full rounded-lg"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit_note" value="Note" />
                <Textarea
                  id="edit_note"
                  placeholder="Add notes about the student..."
                  rows={4}
                  className="w-full rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={updateStudent}
                >
                  Update Student
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
}
