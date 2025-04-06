import { useState, ReactNode, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  FaUsers,
  FaDashcube,
  FaMoneyBill,
  FaChalkboardTeacher,
  FaChild,
  FaStudiovinari,
  FaAdjust,
  FaCalendar,
  FaPaypal,
  FaFileWord,
  FaInfo,
  FaBars,
} from "react-icons/fa";
import { HiLogout } from "react-icons/hi";
import api from "../config";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";
import { Avatar, Badge, Dropdown, Menu } from "antd";
import { BellOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";

// Define the types for the SidebarItem props
interface SidebarItemProps {
  label: string;
  icon: ReactNode;
  dropdownId?: string;
  onClick?: () => void;
  isDropdownOpen?: boolean;
  items?: string[];
  route?: string[];
  currentPath?: string;
}

// Add this icon mapping object
const iconComponents: { [key: string]: ReactNode } = {
  FaUsers: <FaUsers />,
  FaDashcube: <FaDashcube />,
  FaMoneyBill: <FaMoneyBill />,
  FaChalkboardTeacher: <FaChalkboardTeacher />,
  HiLogout: <HiLogout />,
  FaChild: <FaChild />,
  FaStudiovinari: <FaStudiovinari />,
  FaAdjust: <FaAdjust />,
  FaCalendar: <FaCalendar />,
  FaPaypal: <FaPaypal />,
  FaFileWord: <FaFileWord />,
  FaInfo: <FaInfo />,
};

export default function UserLayout() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState<number>(1); // Example notification count

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById("default-sidebar");
      const toggleButton = document.getElementById("sidebar-toggle");
      if (
        sidebar &&
        toggleButton &&
        !sidebar.contains(event.target as Node) &&
        !toggleButton.contains(event.target as Node)
      ) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  useEffect(() => {
    fetchMenu();
  }, []);
  const fetchMenu = async () => {
    try {
      const res = await api.get("/getMenus");
      auth.setAuth({ type: "MENU", payload: { menu: res.data?.data || [] } });
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

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />}>
        Settings
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="logout"
        icon={<HiLogout />}
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
        }}
        danger
      >
        Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="min-h-screen w-[100vw] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Enhanced Navbar */}
      <nav className="fixed top-0 z-50 w-[100vw] border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/95">
        <div className="px-6 py-4 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                id="sidebar-toggle"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 sm:hidden"
              >
                <FaBars className="h-5 w-5" />
              </button>
              <a href="" className="flex items-center gap-3">
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="h-8 w-8 transition-transform hover:scale-110"
                  alt="American Dream"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-800 dark:text-white">
                  American Dream
                </span>
              </a>
            </div>

            {/* Add user menu and notifications */}
            <div className="flex items-center gap-4">
              <Badge
                count={notifications}
                className="cursor-pointer"
                color="gray"
                size="small"
              >
                <BellOutlined className="text-xl text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200" />
              </Badge>
              <Dropdown
                overlay={userMenu}
                trigger={["click"]}
                placement="bottomRight"
              >
                <div className="flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Avatar size="small" icon={<UserOutlined />} />
                  <span className="hidden text-sm font-medium text-gray-700 dark:text-gray-200 md:block">
                    {auth.user?.first_name + " " + auth.user?.last_name ||
                      "User"}
                  </span>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Sidebar */}
      <aside
        id="default-sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform border-r border-gray-200 bg-white/95 pt-16 shadow-lg backdrop-blur-sm transition-all duration-300 ease-in-out dark:border-gray-700 dark:bg-gray-800/95 sm:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Sidenav"
      >
        <div className="flex h-full flex-col justify-between px-3 py-4">
          <div className="space-y-4">
            <div className="px-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Main Menu
              </h2>
            </div>
            <ul className="space-y-1.5">
              <SidebarItem
                label="Dashboard"
                route={["/dashboard"]}
                icon={<FaDashcube />}
                currentPath={currentPath}
              />
              {auth.menus.map((menu: any, key: number) => (
                <SidebarItem
                  key={key}
                  label={menu.menu.menu_name}
                  route={[menu.menu.route]}
                  icon={iconComponents[menu.menu.menu_icon] || null}
                  currentPath={currentPath}
                />
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* Enhanced Main Content */}
      <div className="min-h-screen pt-16 transition-all duration-300 sm:ml-64">
        <div className="container mx-auto p-4">
          <div className="rounded-lg bg-white/50  shadow-md backdrop-blur-sm dark:bg-gray-800/50 md:p-6">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Enhanced Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/50 backdrop-blur-sm transition-opacity duration-300 sm:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

const SidebarItem = ({
  label,
  icon,
  dropdownId,
  onClick = () => {},
  isDropdownOpen,
  items,
  route = [],
  currentPath = "",
}: SidebarItemProps) => {
  const navigate = useNavigate();
  const toNavigate = (url: string) => {
    navigate(url);
  };

  const isSelected = currentPath === route[0];

  return (
    <li>
      {dropdownId ? (
        <button
          onClick={onClick}
          className="group flex w-full items-center justify-between rounded-lg p-2.5 text-base font-medium text-gray-700 transition-all duration-200 hover:bg-gray-100 hover:pl-4 dark:text-gray-200 dark:hover:bg-gray-700"
          aria-controls={dropdownId}
          data-collapse-toggle={dropdownId}
        >
          <div className="flex items-center gap-3">
            {icon && (
              <span className="text-gray-500 transition-colors group-hover:text-primary-500 dark:text-gray-400">
                {icon}
              </span>
            )}
            <span>{label}</span>
          </div>
          <svg
            className="h-5 w-5 transition-transform duration-200 group-aria-expanded:rotate-180"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      ) : (
        <a
          onClick={() => {
            toNavigate(route[0]);
            onClick();
          }}
          className={`flex cursor-pointer items-center gap-3 rounded-lg p-2.5 text-base font-medium transition-all duration-200 hover:pl-4
            ${
              isSelected
                ? "bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-500"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
            }`}
        >
          {icon && (
            <span
              className={`text-lg transition-colors ${
                isSelected
                  ? "text-primary-600 dark:text-primary-500"
                  : "text-gray-500 group-hover:text-primary-500 dark:text-gray-400"
              }`}
            >
              {icon}
            </span>
          )}
          <span>{label}</span>
        </a>
      )}
      {isDropdownOpen && items && (
        <ul id={dropdownId} className="mt-1 space-y-1">
          {items.map((item, key) => (
            <li key={item}>
              <a
                onClick={() => {
                  toNavigate(route[key]);
                }}
                className={`flex cursor-pointer items-center rounded-lg p-2 pl-11 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 ${
                  currentPath === route[key]
                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-500"
                    : ""
                }`}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};
