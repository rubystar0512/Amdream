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
} from "react-icons/fa";
import { HiLogout } from "react-icons/hi";
import api from "../config";
import { toast } from "react-toastify";
import { useAuth } from "../hooks/useAuth";

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
};

export default function UserLayout() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const auth = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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

  return (
    <>
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center justify-start rtl:justify-end">
              <a href="" className="ms-2 flex md:me-24">
                <img
                  src="https://flowbite.com/docs/images/logo.svg"
                  className="me-3 h-8"
                  alt="American Dream"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white sm:text-2xl">
                  American Dream
                </span>
              </a>
            </div>
          </div>
        </div>
      </nav>
      <aside
        id="default-sidebar"
        className={`fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full border-r border-gray-200 bg-white pt-[6vh] transition-transform dark:border-gray-700 dark:bg-gray-800 sm:translate-x-0`}
        aria-label="Sidenav"
      >
        <div className="h-full overflow-y-auto border-r border-gray-200 bg-white px-3 py-5 dark:border-gray-700 dark:bg-gray-800">
          <ul className="space-y-2">
            <SidebarItem
              label={"Dashboard"}
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

            <SidebarItem
              label="Logout"
              icon={<HiLogout />}
              route={["/"]}
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
              }}
              currentPath={currentPath}
            />
          </ul>
        </div>
      </aside>
      <div className="mt-14 max-h-screen sm:ml-64">
        <Outlet />
      </div>
    </>
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
  const toNavigate = (url: string | "/") => {
    navigate(url);
  };

  const isSelected = currentPath === route[0];

  return (
    <li>
      {dropdownId ? (
        <button
          onClick={onClick}
          className="group flex w-full items-center rounded-lg p-2 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
          aria-controls={dropdownId}
          data-collapse-toggle={dropdownId}
        >
          {icon}
          <span className="ml-3 flex-1 whitespace-nowrap text-left">
            {label}
          </span>
          <svg
            aria-hidden="true"
            className="h-6 w-6"
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
          className={`group flex cursor-pointer items-center rounded-lg p-2 text-base font-normal text-gray-900 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
            isSelected ? "bg-gray-100 dark:bg-gray-700" : ""
          }`}
        >
          {icon}
          <span className="ml-3">{label}</span>
        </a>
      )}
      {isDropdownOpen && items && (
        <ul id={dropdownId} className="space-y-2 py-2">
          {items.map((item, key) => (
            <li key={item}>
              <a
                onClick={() => {
                  toNavigate(route[key]);
                }}
                className={`group flex w-full cursor-pointer items-center rounded-lg p-2 pl-11 text-base font-normal text-gray-900 transition duration-75 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700 ${
                  currentPath === route[key]
                    ? "bg-gray-100 dark:bg-gray-700"
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
