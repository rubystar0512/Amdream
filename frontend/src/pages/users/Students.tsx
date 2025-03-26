import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Label,
  Modal,
  TextInput,
  Textarea,
} from "flowbite-react";
import { Table, TableColumnsType, Button as AntButton, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

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
        width: "8%",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "First Name",
        dataIndex: "first_name",
        key: "first_name",
        sorter: (a: any, b: any) => a.first_name.localeCompare(b.first_name),
      },
      {
        title: "Last Name",
        dataIndex: "last_name",
        key: "last_name",
        sorter: (a: any, b: any) => a.last_name.localeCompare(b.last_name),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
      },
      {
        title: "Note",
        dataIndex: "note",
        key: "note",
        render: (_: any, record: any) => (
          <div className="text-center">{record?.note}</div>
        ),
      },
    ] as TableColumnsType<any>
  ).concat(
    permissions.update || permissions.delete
      ? [
          {
            title: "Action",
            key: "action",
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
      render: (_, record) => `${record.first_name} ${record.last_name}`,
      sorter: (a, b) =>
        `${a.first_name} ${a.last_name}`.localeCompare(
          `${b.first_name} ${b.last_name}`,
        ),
    },
    {
      title: "Number of classes",
      dataIndex: "class_count",
      key: "class_count",
      sorter: (a, b) => a.class_count - b.class_count,
    },
  ];

  if (loading_1) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="max-h-[80vh] overflow-auto">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        {user?.role === "teacher" ? (
          <Table
            className="custom-table"
            style={{ width: "70vw" }}
            columns={simpleColumns}
            dataSource={specifiedStudentData}
            loading={loading}
            pagination={false}
            scroll={{ y: "50vh" }}
            sticky
          />
        ) : (
          <>
            {permissions.create && (
              <button
                className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                type="button"
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
              </button>
            )}

            <Table
              className="custom-table"
              style={{ width: "70vw" }}
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
              scroll={{ y: "50vh" }}
              sticky
            />
          </>
        )}
      </div>

      <Modal
        show={openModal}
        size="md"
        onClose={() => {
          setOpenModal(false);
        }}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Add Student
            </h3>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="first_name" value="First Name" />
              </div>
              <TextInput
                id="first_name"
                placeholder="Jack"
                required
                value={eachFirstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="last_name" value="Last Name" />
              </div>
              <TextInput
                id="last_name"
                type="text"
                placeholder="Smith"
                required
                value={eachLastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="email" value="Email" />
              </div>
              <TextInput
                id="email"
                type="email"
                placeholder="student@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="password" value="Password" />
              </div>
              <TextInput
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <div className="mb-2 block">
                <Label htmlFor="note" value="Note" />
              </div>
              <Textarea
                id="note"
                placeholder="Add notes about the student..."
                rows={4}
                className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <div className="flex flex-auto">
              <Button className="flex-none" onClick={createData}>
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

      {/* Edit Student Modal */}
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
                Edit Student
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit_first_name" value="First Name" />
                </div>
                <TextInput
                  id="edit_first_name"
                  required
                  value={eachFirstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit_last_name" value="Last Name" />
                </div>
                <TextInput
                  id="edit_last_name"
                  required
                  value={eachLastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit_email" value="Email" />
                </div>
                <TextInput
                  id="edit_email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label
                    htmlFor="edit_password"
                    value="New Password (optional)"
                  />
                </div>
                <TextInput
                  id="edit_password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit_note" value="Note" />
                </div>
                <Textarea
                  id="edit_note"
                  placeholder="Add notes about the student..."
                  rows={4}
                  className="dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <div className="flex flex-auto">
                <Button className="flex-none" onClick={updateStudent}>
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
}
