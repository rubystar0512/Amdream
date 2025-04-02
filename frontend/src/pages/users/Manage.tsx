import React, { useState, useEffect } from "react";
import { Button, Modal, Label, Select } from "flowbite-react";
import {
  Card,
  Table,
  TableColumnsType,
  Button as AntButton,
  Space,
  Switch,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  MailOutlined,
  LockOutlined,
} from "@ant-design/icons";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { motion } from "framer-motion";

interface User {
  id: number;
  email: string;
  role: {
    id: number;
    role_name: string;
  };
  is_active: boolean;
}

interface Role {
  id: number;
  role_name: string;
}

interface Permission {
  id: number;
  Role: {
    id: number;
    role_name: string;
  };
  Menu: {
    id: number;
    route: string;
  };
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
  download: boolean;
}

interface Menu {
  id: number;
  menu_name: string;
  route: string;
}

const UserManage: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/users/manage");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [permissionsData, setPermissionsData] = useState<any[]>([]);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [openPermissionModal, setOpenPermissionModal] = useState(false);
  const [permissionValues, setPermissionValues] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
    download: false,
  });

  const [menus, setMenus] = useState<Menu[]>([]);
  const [openAddPermissionModal, setOpenAddPermissionModal] = useState(false);
  const [newPermission, setNewPermission] = useState({
    role_id: "",
    menu_id: "",
    create: false,
    read: false,
    update: false,
    delete: false,
    download: false,
  });

  const [openChangeEmailModal, setOpenChangeEmailModal] = useState(false);
  const [openChangePasswordModal, setOpenChangePasswordModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        fetchData();
      }
    }
  }, [permissions, navigate, loading_1]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, permissionsRes, menusRes] = await Promise.all([
        api.get("/users"),
        api.get("/roles"),
        api.get("/permissions"),
        api.get("/menus"),
      ]);

      setUsers(usersRes.data.data || []);
      setRoles(rolesRes.data.data || []);
      setPermissionsData(permissionsRes.data.data || []);
      setMenus(menusRes.data.data || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      handleApiError(error);
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      toast.success("User deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error deleting user:", error);
      handleApiError(error);
    }
  };

  const openEditUser = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role.id.toString());
    setOpenEditModal(true);
  };

  const updateUserRole = async () => {
    if (!selectedUser) return;

    try {
      await api.put(`/users/${selectedUser.id}/role`, {
        role_id: selectedRole,
      });

      await fetchData();
      setOpenEditModal(false);
      setSelectedUser(null);
      toast.success("User role updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating user role:", error);
      handleApiError(error);
    }
  };

  const openEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setPermissionValues({
      create: permission.create,
      read: permission.read,
      update: permission.update,
      delete: permission.delete,
      download: permission.download,
    });
    setOpenPermissionModal(true);
  };

  const updatePermission = async () => {
    if (!selectedPermission) return;

    try {
      await api.put(`/permissions/${selectedPermission.id}`, {
        ...permissionValues,
      });

      await fetchData();
      setOpenPermissionModal(false);
      setSelectedPermission(null);
      toast.success("Permissions updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      handleApiError(error);
    }
  };

  const createPermission = async () => {
    try {
      await api.post("/permissions", newPermission);
      await fetchData();
      setOpenAddPermissionModal(false);
      setNewPermission({
        role_id: "",
        menu_id: "",
        create: false,
        read: false,
        update: false,
        delete: false,
        download: false,
      });
      toast.success("Permission created successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error creating permission:", error);
      handleApiError(error);
    }
  };

  const updateUserEmail = async () => {
    if (!selectedUser || !newEmail) return;

    try {
      await api.put(`/users/${selectedUser.id}/email`, {
        email: newEmail,
      });

      await fetchData();
      setOpenChangeEmailModal(false);
      setSelectedUser(null);
      setNewEmail("");
      toast.success("User email updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating user email:", error);
      handleApiError(error);
    }
  };

  const updateUserPassword = async () => {
    if (!selectedUser || !newPassword) return;

    try {
      await api.put(`/users/${selectedUser.id}/password`, {
        password: newPassword,
      });

      setOpenChangePasswordModal(false);
      setSelectedUser(null);
      setNewPassword("");
      toast.success("User password updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating user password:", error);
      handleApiError(error);
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await api.put(`/users/${user.id}/status`, {
        is_active: !user.is_active,
      });

      await fetchData(); // Refresh the users list
      toast.success(
        `User ${user.is_active ? "deactivated" : "activated"} successfully!`,
        { theme: "dark" },
      );
    } catch (error: any) {
      console.error("Error updating user status:", error);
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

  const columns: TableColumnsType<User> = (
    [
      {
        title: "No",
        dataIndex: "index",
        key: "index",
        width: "8%",
        render: (_: any, __: any, index: number) => (
          <span className="font-medium text-gray-600 dark:text-gray-400">
            {index + 1}
          </span>
        ),
      },
      {
        title: "Email",
        dataIndex: "email",
        key: "email",
        sorter: (a: any, b: any) => a.email.localeCompare(b.email),
        render: (email: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {email}
          </span>
        ),
      },
      {
        title: "Role",
        dataIndex: ["role", "role_name"],
        key: "role",
        sorter: (a: any, b: any) =>
          a.role.role_name.localeCompare(b.role.role_name),
        render: (role: string) => (
          <span className="font-medium text-gray-900 dark:text-white">
            {role}
          </span>
        ),
      },
      {
        title: "Status",
        dataIndex: "is_active",
        key: "is_active",
        render: (is_active: boolean, record: User) => (
          <Switch
            checked={is_active}
            onChange={() => permissions.update && toggleUserStatus(record)}
            disabled={!permissions.update}
          />
        ),
      },
    ] as TableColumnsType<User>
  ).concat(
    permissions.update || permissions.delete
      ? [
          {
            title: "Action",
            key: "action",
            width: "12vw",
            render: (_: any, record: User) => (
              <Space size="middle">
                {permissions.update && (
                  <>
                    <AntButton
                      type="text"
                      icon={<EditOutlined />}
                      onClick={() => openEditUser(record)}
                      style={{ color: "white" }}
                    />
                    <AntButton
                      type="text"
                      icon={<MailOutlined />}
                      onClick={() => {
                        setSelectedUser(record);
                        setOpenChangeEmailModal(true);
                      }}
                      style={{ color: "white" }}
                    />
                    <AntButton
                      type="text"
                      icon={<LockOutlined />}
                      onClick={() => {
                        setSelectedUser(record);
                        setOpenChangePasswordModal(true);
                      }}
                      style={{ color: "white" }}
                    />
                  </>
                )}
                {permissions.delete && (
                  <AntButton
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deleteUser(record.id)}
                    style={{ color: "#ef4444" }}
                  />
                )}
              </Space>
            ),
          },
        ]
      : [],
  );

  const permissionsColumns: TableColumnsType<Permission> = [
    {
      title: "No",
      dataIndex: "index",
      key: "index",
      width: "8%",
      render: (_: any, __: any, index: number) => (
        <span className="font-medium text-gray-600 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      title: "RoleName",
      dataIndex: ["role", "role_name"],
      key: "role_name",
      sorter: (a: any, b: any) =>
        a.role.role_name.localeCompare(b.role.role_name),
      render: (role_name: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {role_name}
        </span>
      ),
    },
    {
      title: "Menu",
      dataIndex: ["menu", "menu_name"],
      key: "menu_path",
      sorter: (a: any, b: any) =>
        a.menu.menu_path.localeCompare(b.menu.menu_path),
      render: (menu_path: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {menu_path}
        </span>
      ),
    },
    {
      title: "Create",
      dataIndex: "create",
      key: "create",
      render: (text: any) => (text ? "Yes" : "No"),
    },
    {
      title: "Read",
      dataIndex: "read",
      key: "read",
      render: (text: any) => (text ? "Yes" : "No"),
    },
    {
      title: "Update",
      dataIndex: "update",
      key: "update",
      render: (text: any) => (text ? "Yes" : "No"),
    },
    {
      title: "Delete",
      dataIndex: "delete",
      key: "delete",
      render: (text: any) => (text ? "Yes" : "No"),
    },
    {
      title: "Download",
      dataIndex: "download",
      key: "download",
      render: (text: any) => (text ? "Yes" : "No"),
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: Permission) => (
        <Space size="middle">
          {permissions.update && (
            <AntButton
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                openEditPermission(record);
                console.log(record);
              }}
              style={{ color: "white" }}
            />
          )}
        </Space>
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
      height: "auto", // Changed from fixed height
      maxHeight: "60vh",
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
      className="flex w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
    >
      {/* Users Card */}
      <Card
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">
              User Manage
            </span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          <Table
            style={{ width: "100%" }}
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={false}
            loading={{
              spinning: loading,
              size: "large",
            }}
            scroll={{ x: "max-content", y: "calc(60vh - 120px)" }}
            size="middle"
            className="custom-table"
          />
        </div>
      </Card>

      {/* Permissions Card */}
      <Card
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">
              Permission Manage
            </span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
        extra={
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
            {permissions.create && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setOpenAddPermissionModal(true)}
              >
                + Add New Permission
              </motion.button>
            )}
          </div>
        }
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          <Table
            style={{ width: "100%" }}
            columns={permissionsColumns}
            dataSource={permissionsData}
            rowKey="id"
            pagination={false}
            loading={{
              spinning: loading,
              size: "large",
            }}
            scroll={{ x: "max-content", y: "calc(60vh - 120px)" }}
            size="middle"
            className="custom-table"
          />
        </div>
      </Card>

      {/* Edit User Role Modal */}
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
                Edit User Role
              </h3>
              <div>
                <Label htmlFor="role" value="Role" />
                <Select
                  id="role"
                  required
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-lg"
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.role_name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={updateUserRole}
                >
                  Update
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

      {/* Edit Permission Modal */}
      {permissions.update && (
        <Modal
          show={openPermissionModal}
          size="md"
          onClose={() => setOpenPermissionModal(false)}
          popup
          className="responsive-modal"
        >
          <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
          <Modal.Body>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Edit Permissions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(permissionValues).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`permission_${key}`}
                      checked={value}
                      onChange={(e) =>
                        setPermissionValues((prev) => ({
                          ...prev,
                          [key]: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor={`permission_${key}`} className="capitalize">
                      {key}
                    </Label>
                  </div>
                ))}
              </div>
              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={updatePermission}
                >
                  Update
                </Button>
                <Button
                  className="xs:w-auto w-full"
                  color="gray"
                  onClick={() => setOpenPermissionModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {/* Add Permission Modal */}
      {permissions.create && (
        <Modal
          show={openAddPermissionModal}
          size="md"
          onClose={() => setOpenAddPermissionModal(false)}
          popup
          className="responsive-modal"
        >
          <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
          <Modal.Body>
            <div className="space-y-4">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                Add New Permission
              </h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="role_id" value="Role" />
                  <Select
                    id="role_id"
                    required
                    value={newPermission.role_id}
                    onChange={(e) =>
                      setNewPermission({
                        ...newPermission,
                        role_id: e.target.value,
                      })
                    }
                    className="w-full rounded-lg"
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.role_name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="menu_id" value="Menu" />
                  <Select
                    id="menu_id"
                    required
                    value={newPermission.menu_id}
                    onChange={(e) =>
                      setNewPermission({
                        ...newPermission,
                        menu_id: e.target.value,
                      })
                    }
                    className="w-full rounded-lg"
                  >
                    <option value="">Select Menu</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.menu_name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(newPermission)
                    .filter(([key]) =>
                      [
                        "create",
                        "read",
                        "update",
                        "delete",
                        "download",
                      ].includes(key),
                    )
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`new_permission_${key}`}
                          checked={Boolean(value)}
                          onChange={(e) =>
                            setNewPermission((prev) => ({
                              ...prev,
                              [key]: e.target.checked,
                            }))
                          }
                          className="rounded"
                        />
                        <Label
                          htmlFor={`new_permission_${key}`}
                          className="capitalize"
                        >
                          {key}
                        </Label>
                      </div>
                    ))}
                </div>
              </div>
              <div className="xs:flex-row flex flex-col gap-2 pt-4">
                <Button
                  className="xs:w-auto w-full"
                  gradientDuoTone="purpleToBlue"
                  onClick={createPermission}
                >
                  Add Permission
                </Button>
                <Button
                  className="xs:w-auto w-full"
                  color="gray"
                  onClick={() => setOpenAddPermissionModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal.Body>
        </Modal>
      )}

      {permissions.update && (
        <>
          <Modal
            show={openChangeEmailModal}
            size="md"
            onClose={() => setOpenChangeEmailModal(false)}
            popup
          >
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Change User Email
                </h3>

                <div>
                  <Label htmlFor="email" value="New Email" />
                  <input
                    type="email"
                    id="email"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-auto">
                  <Button
                    className="flex-none"
                    onClick={updateUserEmail}
                    disabled={!newEmail}
                  >
                    Update
                  </Button>
                  <Button
                    className="ml-2 flex-none"
                    onClick={() => setOpenChangeEmailModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>

          <Modal
            show={openChangePasswordModal}
            size="md"
            onClose={() => setOpenChangePasswordModal(false)}
            popup
          >
            <Modal.Header />
            <Modal.Body>
              <div className="space-y-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Change User Password
                </h3>

                <div>
                  <Label htmlFor="password" value="New Password" />
                  <input
                    type="password"
                    id="password"
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-auto">
                  <Button
                    className="flex-none"
                    onClick={updateUserPassword}
                    disabled={!newPassword}
                  >
                    Update
                  </Button>
                  <Button
                    className="ml-2 flex-none"
                    onClick={() => setOpenChangePasswordModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </>
      )}
    </motion.div>
  );
};

export default UserManage;
