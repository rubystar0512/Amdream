import { useState, useEffect } from "react";
import { Card, Button, Label, Modal, TextInput } from "flowbite-react";
import { Table, TableColumnsType, Button as AntButton, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";

interface ClassType {
  id: number;
  name: string;
  createdAt: string;
  action: any;
}

export default function ClassType() {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/class/type");
  const [classTypeData, setClassTypeData] = useState<ClassType[]>([]);
  const [name, setName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedClassType, setSelectedClassType] = useState<ClassType | null>(
    null,
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        fetchClassTypes();
      }
    }
  }, [permissions, navigate, loading_1]);

  const fetchClassTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/class-types");
      setClassTypeData(res.data || []);
      setLoading(false);
    } catch (error: any) {
      handleApiError(error);
      setLoading(false);
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

  const createClassType = async () => {
    if (!name) {
      toast.error("Name is required.", { theme: "dark" });
      return;
    }

    try {
      const res = await api.post("/class-types", { name });
      
      setClassTypeData((prevData) => [...prevData, res?.data?.classType]);
      setName("");
      setOpenModal(false);
      toast.success("Class type added successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const deleteClassType = async (id: number) => {
    try {
      await api.delete(`/class-types/${id}`);
      setClassTypeData((prevData) =>
        prevData.filter((classType) => classType.id !== id),
      );
      toast.success("Class type deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const openEditClassType = (classType: ClassType) => {
    setSelectedClassType(classType);
    setName(classType.name);
    setOpenEditModal(true);
  };

  const updateClassType = async () => {
    if (!selectedClassType || !name) return;

    try {
      const res = await api.put(`/class-types/${selectedClassType.id}`, {
        name,
      });

      setClassTypeData(prevData => 
        prevData.map(classType => 
          classType.id === selectedClassType.id ? res.data.classType : classType
        )
      );
      
      setOpenEditModal(false);
      setSelectedClassType(null);
      setName("");
      toast.success("Class type updated successfully!", { theme: "dark" });
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const columns: TableColumnsType<ClassType> = (
    [
      {
        title: "No",
        dataIndex: "index",
        key: "index",
        width: "8%",
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a: any, b: any) => a.name.localeCompare(b.name),
      },
      
    ] as TableColumnsType<ClassType>
  ).concat(
    permissions.update || permissions.delete
      ? ([
          {
            title: "Action",
            key: "action",
            render: (_: any, record: ClassType) => (
              <Space size="middle">
                {permissions.update && (
                  <AntButton
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => openEditClassType(record)}
                    style={{ color: "white" }}
                  />
                )}
                {permissions.delete && (
                  <AntButton
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteClassType(record.id)}
                    style={{ color: "#ef4444" }}
                  />
                )}
              </Space>
            ),
          },
        ] as TableColumnsType<ClassType>)
      : [],
  );

  if (loading_1) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="max-h-[80vh]">
      <div className="custom-table shadow-md sm:rounded-lg">
        {permissions.create && (
          <button
            className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            type="button"
            onClick={() => {
              setOpenModal(true);
              setName("");
            }}
          >
            + Add Class Type
          </button>
        )}

        <Table
          style={{ width: "70vw" }}
          className="custom-table"
          columns={columns}
          dataSource={classTypeData.map((item, index) => ({
            ...item,
            key: index,
          }))}
          pagination={false}
          loading={{
            spinning: loading,
            size: "large",
          }}
          scroll={{ y: "50vh" }}
          sticky
        />
      </div>

      {/* Add Class Type Modal */}
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
                Add Class Type
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="name" value="Name" />
                </div>
                <TextInput
                  id="name"
                  placeholder="Enter class type name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-auto">
                <Button className="flex-none" onClick={createClassType}>
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

      {/* Edit Class Type Modal */}
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
                Edit Class Type
              </h3>
              <div>
                <div className="mb-2 block">
                  <Label htmlFor="edit-name" value="Name" />
                </div>
                <TextInput
                  id="edit-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="flex flex-auto">
                <Button className="flex-none" onClick={updateClassType}>
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
