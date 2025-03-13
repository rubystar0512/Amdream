import { useState, useEffect } from "react";
import {
  Card,
  Button,
  Checkbox,
  Label,
  Modal,
  TextInput,
} from "flowbite-react";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Table, TableColumnsType, Button as AntButton } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function Teachers() {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/users/teachers");
  const [teacherData, setTeacherData] = useState<any[]>([]);
  const [eachFirstName, setFirstName] = useState("");
  const [eachLastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [eachRates, setEachRates] = useState<any[]>([]);
  const [classType, setClassType] = useState<any[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        const fetchTeachers = async () => {
          try {
            setLoading(true);
            const res = await api.get("/teachers");
            setTeacherData(res.data || []);

            const res1 = await api.get("/class-types");
            setClassType(res1.data || []);
            setLoading(false);
          } catch (error: any) {
            handleApiError(error);
          }
        };

        fetchTeachers();
      }
    }
  }, [permissions, navigate, loading_1]);

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
    if (!eachFirstName || !eachLastName || !email || !password || !eachRates.length) {
      toast.error("All fields are required.", { theme: "dark" });
      return;
    }

    try {
      const res = await api.post("/teachers", {
        first_name: eachFirstName,
        last_name: eachLastName,
        email: email,
        password: password,
        rates: eachRates,
      });

      setTeacherData([...res.data?.teachers]);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setEachRates([]);
      toast.success("Teacher added successfully!", { theme: "dark" });
      setOpenModal(false);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const deleteEachData = async (id: string) => {
    try {
      const res = await api.delete(`/teachers/${id}`);
      setTeacherData([...res.data?.teachers]);
      toast.success("Teacher deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const openEditTeacher = (teacher: any) => {
    setSelectedTeacher(teacher);
    setFirstName(teacher.first_name);
    setLastName(teacher.last_name);
    setEmail(teacher.email);
    setPassword("");
    setEachRates(teacher.TeacherRates || []);
    setOpenEditModal(true);
  };

  const updateTeacher = async () => {
    if (!selectedTeacher) return;

    try {
      const updateData: any = {
        first_name: eachFirstName,
        last_name: eachLastName,
        email: email,
      };

      if (password) {
        updateData.password = password;
      }

      await api.put(`/teachers/${selectedTeacher.id}`, updateData);

      await api.post(`/teachers/${selectedTeacher.id}/rates`, {
        rates: eachRates,
      });

      const res = await api.get("/teachers");
      setTeacherData([...res.data]);

      setOpenEditModal(false);
      setSelectedTeacher(null);
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setEachRates([]);
      toast.success("Teacher updated successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleRateChange = (classTypeId: number, value: string) => {
    setEachRates((prevRates) => {
      const updatedRates = [...prevRates];
      const index = updatedRates.findIndex(
        (rate) => rate.class_type_id === classTypeId,
      );

      if (index !== -1) {
        updatedRates[index].rate = value;
      } else {
        updatedRates.push({ class_type_id: classTypeId, rate: value });
      }
      return updatedRates;
    });
  };

  const columns: TableColumnsType<any> = (
    [
      {
        title: "No",
        dataIndex: "index",
        width: "8%",
        key: "index",
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
        title: "Class Type",
        dataIndex: "class_types",
        key: "class_types",
        width: "25%",
        render: (_: any, record: any) => (
          <>
            {record.TeacherRates?.map((rate: any) => (
              <span key={rate?.class_type_id}> {rate?.class_type?.name} </span>
            ))}
          </>
        ),
      },
      
    ] as TableColumnsType<any>
  ).concat(
    permissions.update || permissions.delete
      ? [
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Space size="middle">
                {permissions.update && (
                  <AntButton
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditTeacher(record)}
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

  if (loading_1) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="max-h-[80vh] overflow-auto">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
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
              setEachRates([]);
            }}
          >
            + Add Teacher
          </button>
        )}

        <Table
          style={{ width: "70vw" }}
          columns={columns}
          dataSource={teacherData.map((item, index) => ({
            ...item,
            key: index,
          }))}
          loading={{
            spinning: loading,
            size: "large",
          }}
          pagination={false}
          className="custom-table"
          scroll={{ y: "50vh" }}
          sticky
        />
      </div>

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
                Add Teacher
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="First Name" />
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
                  <Label htmlFor="last name" value="Last Name" />
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
                  placeholder="jack.smith@example.com"
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
                  placeholder="********"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {classType.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.id}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`class_type_${item.id}`}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEachRates((prev) => [
                            ...prev,
                            {
                              class_type_id: item.id,
                              rate: "",
                            },
                          ]);
                        } else {
                          setEachRates((prev) =>
                            prev.filter(
                              (rate) => rate.class_type_id !== item.id,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`class_type_${item.id}`}>{item.name}</Label>
                  </div>
                  <TextInput
                    id={`rate_per_type_${item.id}`}
                    type="number"
                    placeholder="10"
                    value={
                      eachRates.find((rate) => rate.class_type_id === item.id)
                        ?.rate || ""
                    }
                    onChange={(e) => handleRateChange(item.id, e.target.value)}
                    disabled={
                      !eachRates.some((rate) => rate.class_type_id === item.id)
                    }
                  />
                </div>
              ))}
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
      )}

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
                Edit Teacher
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="First Name" />
                </div>
                <TextInput
                  id="first_name"
                  required
                  value={eachFirstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="last name" value="Last Name" />
                </div>
                <TextInput
                  id="last_name"
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
                  placeholder="example@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="password" value={openEditModal ? "New Password (leave blank to keep current)" : "Password"} />
                </div>
                <TextInput
                  id="password"
                  type="password"
                  required={!openEditModal}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {classType.map((item) => (
                <div
                  className="flex items-center justify-between"
                  key={item.id}
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`class_type_${item.id}`}
                      checked={eachRates.some(
                        (rate) => rate.class_type_id === item.id,
                      )}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setEachRates((prev) => [
                            ...prev,
                            {
                              class_type_id: item.id,
                              rate: "",
                              id: selectedTeacher.id,
                            },
                          ]);
                        } else {
                          setEachRates((prev) =>
                            prev.filter(
                              (rate) => rate.class_type_id !== item.id,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`class_type_${item.id}`}>{item.name}</Label>
                  </div>
                  <TextInput
                    id={`rate_per_type_${item.id}`}
                    type="number"
                    placeholder="10"
                    value={
                      eachRates.find((rate) => rate.class_type_id === item.id)
                        ?.rate || ""
                    }
                    onChange={(e) => handleRateChange(item.id, e.target.value)}
                    disabled={
                      !eachRates.some((rate) => rate.class_type_id === item.id)
                    }
                  />
                </div>
              ))}
              <div className="flex flex-auto">
                <Button className="flex-none" onClick={updateTeacher}>
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
