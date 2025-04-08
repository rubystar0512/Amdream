import { useEffect } from "react";
import { BryntumCalendar, BryntumCalendarProps } from "@bryntum/calendar-react";
import { useState } from "react";
import { Modal, Card } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import api from "../../config";

import "../../App.scss";

function Calendar() {
  const navigate = useNavigate();
  const auth = useAuth();

  const { permissions, loading_1 } = usePermissions("/calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const isManager =
    auth.user?.role === "manager" || auth.user?.role === "admin";
  const [calendarProps, setCalendarProps] = useState<BryntumCalendarProps>({
    date: new Date(),

    crudManager: {
      eventStore: {
        fields: [
          { name: "class_type", type: "string" },
          { name: "student_name", type: "string" },
          { name: "payment_status", type: "string" },
          { name: "class_status", type: "string" },
        ],
      },
      listeners: {
        beforeLoad: (data: any) => {
          const response = data?.response;
          if (!isManager && response?.events) {
            response.events = response.events.filter(
              (event: any) => event.teacherId === auth.user?.id,
            );
          }
          return response;
        },
      },
      transport: {
        load: {
          url: `${api.defaults.baseURL}/calendar/events`,
          method: "GET",
        },
        sync: {
          url: `${api.defaults.baseURL}/calendar/events`,
          method: "POST",
        },
      },
      autoLoad: true,
      writeAllFields: true,
      autoSync: true,
      validateResponse: false,
    },

    eventEditFeature: {
      editorConfig: {
        items: {
          classTypeField: {
            type: "combo",
            name: "class_type",
            label: "Class Type",
            weight: 110,
            disabled:
              auth.user?.role !== "manager" && auth.user?.role !== "admin",
            items: [
              { value: "trial", text: "Trial Lesson (30 min)" },
              { value: "regular", text: "Regular (60 min)" },
            ],
            required: true,
          },

          studentNameField: {
            type: "combo",
            name: "student_name",
            label: "Student",
            weight: 120,
            items: students,
            required: true,
          },

          paymentStatusField: {
            type: "combo",
            name: "payment_status",
            label: "Payment",
            weight: 130,
            disabled:
              auth.user?.role !== "manager" && auth.user?.role !== "admin",
            items: [
              { value: "paid", text: "Paid" },
              { value: "unpaid", text: "Not Paid" },
            ],
            required: true,
          },

          classStatusField: {
            type: "combo",
            name: "class_status",
            label: "Class Status",
            weight: 140,
            items:
              auth.user?.role === "manager" || auth.user?.role === "admin"
                ? [
                    { value: "given", text: "Given" },
                    { value: "noShowStudent", text: "No Show Student" },
                    { value: "noShowTeacher", text: "No Show Teacher" },
                  ]
                : [
                    { value: "given", text: "Given" },
                    { value: "noShowStudent", text: "No Show Student" },
                  ],
            required: true,
          },
        },
      },
    },
  });

  useEffect(() => {
    if (!loading_1) {
      if (!permissions.read) {
        navigate("/");
        toast.error("You don't have permission to view this page", {
          theme: "dark",
        });
      } else {
        const fetchData = async () => {
          setLoading(true);
          try {
            const response = await api.get("/students");
            const studentsList = response?.data?.map((student: any) => ({
              value: student?.id,
              text: student?.first_name + " " + student?.last_name,
            }));
            setStudents(studentsList);
            setCalendarProps((prev: any) => ({
              ...prev,
              eventEditFeature: {
                ...prev.eventEditFeature,
                editorConfig: {
                  ...prev.eventEditFeature?.editorConfig,
                  items: {
                    classTypeField:
                      prev.eventEditFeature?.editorConfig?.items
                        ?.classTypeField,
                    studentNameField: {
                      type: "combo",
                      name: "student_name",
                      label: "Student",
                      weight: 120,
                      items: studentsList,
                    },
                    paymentStatusField:
                      prev.eventEditFeature?.editorConfig?.items
                        ?.paymentStatusField,
                    classStatusField:
                      prev.eventEditFeature?.editorConfig?.items
                        ?.classStatusField,
                  },
                },
              },
            }));
            setLoading(false);
          } catch (error: any) {
            handleApiError(error);
            setLoading(false);
          }
        };

        fetchData();
      }
    }
  }, [permissions, navigate, loading_1]);

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

  if (loading_1) {
    return <LoadingSpinner />;
  }

  if (loading) {
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
      height: "100vh", // Changed from fixed height
      maxHeight: "100vh",
      "@media (min-width: 640px)": {
        padding: "20px",
      },
    },
  };

  return (
    <div className="calendar-container flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex h-[100vh] w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
      >
        <Card
          title={
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold text-white">Calendar</span>
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            </div>
          }
          className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
          headStyle={cardStyles.header}
          bodyStyle={cardStyles.body}
          // extra={
          //   <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
          //     <div
          //       className="flex flex-col gap-2 xs:flex-row"
          //       onClick={() => setIsModalOpen(true)}
          //     >
          //       <motion.button
          //         whileHover={{ scale: 1.02 }}
          //         whileTap={{ scale: 0.98 }}
          //         className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          //       >
          //         <FullscreenOutlined className="mr-2" /> Zoom In
          //       </motion.button>
          //     </div>
          //   </div>
          // }
        >
          <BryntumCalendar {...calendarProps} />

          <Modal
            title="Calendar"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            width="100vw"
            style={{ top: 20 }}
            bodyStyle={{ height: "87.5vh" }}
            className="calendar-modal"
          >
            <div style={{ height: "100%" }}>
              <BryntumCalendar {...calendarProps} />
            </div>
          </Modal>
        </Card>
      </motion.div>
    </div>
  );
}

export default Calendar;
