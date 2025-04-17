import { useEffect, useRef } from "react";
import { BryntumCalendar, BryntumCalendarProps } from "@bryntum/calendar-react";
import { useState } from "react";
import { Modal, Card, DatePicker, Table, Checkbox } from "antd";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FullscreenOutlined, ClockCircleTwoTone } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import api from "../../config";

import "../../App.scss";
import { Label } from "flowbite-react";

const { RangePicker } = DatePicker;
function Calendar() {
  const navigate = useNavigate();
  const auth = useAuth();
  const calendarRef = useRef<BryntumCalendar>(null);
  const { permissions, loading_1 } = usePermissions("/calendar");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [isTimerangeModalOpen, setIsTimerangeModalOpen] = useState(false);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [timeRanges, setTimeRanges] = useState<any[]>([]);
  const [recurrenceRule, setRecurrenceRule] = useState(false);

  const isManager =
    auth.user?.role === "manager" || auth.user?.role === "admin";

  const [calendarProps, setCalendarProps] = useState<BryntumCalendarProps>({
    date: new Date(),
    timeRangesFeature: {
      headerWidth: 12,
    },
    sidebar: {
      items: {
        resourceFilter: {
          selectAllItem:
            auth.user?.role === "manager" || auth.user?.role === "admin",
        },
      },
    },
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
        beforeLoadApply: (data: any) => {
          const response = data?.response;

          if (!isManager && auth.user?.id) {
            if (response?.resources?.rows) {
              response.resources.rows = response.resources.rows.filter(
                (resource: any) =>
                  parseInt(resource.id) === parseInt(auth.user?.id || "0"),
              );
            }
            if (response?.events?.rows) {
              response.events.rows = response.events.rows.filter(
                (event: any) =>
                  parseInt(event.resourceId) === parseInt(auth.user?.id || "0"),
              );
            }

            if (response?.timeRanges?.rows) {
              response.timeRanges.rows = response.timeRanges.rows.filter(
                (timeRange: any) =>
                  parseInt(timeRange.teacher_id) ===
                  parseInt(auth.user?.id || "0"),
              );
            }
          }

          return response;
        },

        sync: {
          //@ts-ignore
          fn() {
            //@ts-ignore
            calendarRef.current?.calendarInstance.crudManager.load();
          },
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
      autoSync: true,
      writeAllFields: true,
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
            listeners: {
              change: (event: { source: any }) => {
                const combo = event.source;
                const editor = combo?.owner;

                if (!editor || !editor.record) {
                  console.warn("Editor or event record not found");
                  return;
                }
                const classType = combo.value;
                const increment = classType === "trial" ? 30 : 60;

                const eventRecord = editor.record;
                const startDate = eventRecord.startDate;

                if (!startDate) return;
                const newEnd = new Date(
                  startDate.getTime() + increment * 60000,
                );
                const endTimeField = editor.widgetMap?.endTimeField;
                if (endTimeField) {
                  endTimeField.value = newEnd;
                }
              },
            },
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
                    { value: "scheduled", text: "Scheduled" },
                  ]
                : [
                    { value: "given", text: "Given" },
                    { value: "noShowStudent", text: "No Show Student" },
                    { value: "scheduled", text: "Scheduled" },
                  ],
            required: true,
          },
        },
      },
      listeners: {},
      // onBeforeSave: async (data: any) => {
      //   try {
      //     // Make API call to save the event
      //     const response = await api.post("/calendar/events", data.data);

      //     if (response.status === 200) {
      //       toast.success("Event saved successfully", { theme: "dark" });
      //       return data;
      //     }
      //   } catch (error) {
      //     toast.error("Failed to save event", { theme: "dark" });
      //     return false; // Prevent the save operation
      //   }
      // },

      // onBeforeDelete: (data: any) => {
      //   console.log(data);
      //   return data;
      // },
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
        const isWithinAvailableTime = (
          startDate: Date,
          endDate: Date,
          ranges: { startDate: string; endDate: string }[],
        ): boolean => {
          return ranges.some((range) => {
            const rangeStart = new Date(range.startDate);
            const rangeEnd = new Date(range.endDate);
            return startDate >= rangeStart && endDate <= rangeEnd;
          });
        };

        const fetchData = async () => {
          setLoading(true);
          try {
            console.log("dddd");
            const response = await api.get("/students");
            const studentsList = response?.data
              ?.filter(
                (student: any) => student?.first_name && student?.last_name,
              )
              .map((student: any) => ({
                value: student.id,
                text: `${student.first_name} ${student.last_name}`.trim(),
              }))
              .sort((a: any, b: any) => a.text.localeCompare(b.text));
            setStudents(studentsList);
            setCalendarProps((prev: any) => ({
              ...prev,
              listeners: {
                beforeEventEdit: (context: any) => {
                  const eventRecord = context?.eventRecord;
                  const isManager =
                    auth.user?.role === "manager" ||
                    auth.user?.role === "admin";

                  const isValid = isWithinAvailableTime(
                    eventRecord?.startDate,
                    eventRecord?.endDate,
                    timeRanges,
                  );

                  if (isManager && !isValid) {
                    toast.info(
                      "Managers cannot edit unavailable time ranges.",
                      {
                        theme: "dark",
                      },
                    );

                    // 🔥 Destroy lingering editor instance
                    const editor =
                      calendarRef.current?.calendarInstance?.features?.eventEdit
                        ?.editor;

                    if (editor) {
                      editor.cancelEditing?.(); // Safely cancel
                      editor.hide?.(); // Hide forcibly
                      editor.record = null; // Clear record reference
                    }

                    return false;
                  }

                  return true;
                },
              },
              eventEditFeature: {
                ...prev.eventEditFeature,
                editorConfig: {
                  ...prev.eventEditFeature?.editorConfig,
                  items: {
                    nameField: false,
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
                listeners: {},
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

  const addTimerange = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select a date and time", { theme: "dark" });
      return;
    }

    try {
      const response = await api.post("/calendar/timerange", {
        teacher_id: auth.user?.id,
        startDate: startDate?.format("YYYY-MM-DD HH:mm"),
        endDate: endDate?.format("YYYY-MM-DD HH:mm"),
        recurrenceRule: recurrenceRule ? "FREQ=WEEKLY" : null,
      });

      if (response.status === 200) {
        toast.success("Timerange added successfully", { theme: "dark" });
        //@ts-ignore
        calendarRef.current?.calendarInstance.crudManager.load();
        setIsTimerangeModalOpen(false);
        setStartDate(null);
        setEndDate(null);
        setRecurrenceRule(false);
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
    },
    {
      title: "Actions",
      dataIndex: "actions",
      render: (_: any, record: any) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => timeRangeDelete(record)}
            className="rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  const timeRangeDelete = async (record: any) => {
    try {
      const response = await api.delete(`/calendar/timerange/${record.id}`);
      if (response.status === 200) {
        toast.success("Timerange deleted successfully", { theme: "dark" });
        setTimeRanges([
          ...timeRanges.filter((timeRange: any) => timeRange.id !== record.id),
        ]);
        //@ts-ignore
        calendarRef.current?.calendarInstance.crudManager.load();
      }
    } catch (error) {
      handleApiError(error);
    }
  };

  useEffect(() => {
    const fetchTimeRanges = async () => {
      try {
        const response = await api.get("/calendar/timerange");
        setTimeRanges([...response.data?.timeRanges]);
      } catch (error) {
        handleApiError(error);
      }
    };
    fetchTimeRanges();
  }, [isTimerangeModalOpen]);

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
      height: "auto", // Changed from fixed height
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
        className="flex h-auto w-full flex-col gap-4 overflow-y-auto p-3 md:p-6"
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
          extra={
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
              {!isManager && (
                <div
                  className="flex flex-col gap-2 xs:flex-row"
                  onClick={() => setIsTimerangeModalOpen(true)}
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <ClockCircleTwoTone className="mr-2" /> Add Timerange
                  </motion.button>
                </div>
              )}

              <div
                className="flex flex-col gap-2 xs:flex-row"
                onClick={() => setIsModalOpen(true)}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <FullscreenOutlined className="mr-2" /> Zoom In
                </motion.button>
              </div>
            </div>
          }
        >
          <BryntumCalendar ref={calendarRef} {...calendarProps} />

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
              <BryntumCalendar ref={calendarRef} {...calendarProps} />
            </div>
          </Modal>

          <Modal
            className="time-range-modal"
            title="Add Availability Timerange"
            open={isTimerangeModalOpen}
            onCancel={() => setIsTimerangeModalOpen(false)}
            footer={[
              <div className="flex justify-end gap-2">
                <button
                  key="submit"
                  className="rounded-lg bg-gradient-to-r from-blue-900 to-indigo-600 px-4 py-2 text-sm font-medium text-white hover:from-blue-700 hover:to-indigo-700"
                  onClick={addTimerange}
                >
                  Add Timerange
                </button>
                <button
                  key="cancel"
                  onClick={() => setIsTimerangeModalOpen(false)}
                  className="mr-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>,
            ]}
            width={"60vw"}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4">
                <br />
                <Label>Select Date and Time:</Label>
                <RangePicker
                  value={[startDate, endDate]}
                  showTime={{ format: "HH:mm" }}
                  format="YYYY-MM-DD HH:mm"
                  onChange={(value) => {
                    if (value) {
                      setStartDate(value[0] || null);
                      setEndDate(value[1] || null);
                    }
                  }}
                />
                <div className="flex flex-col gap-2 text-white">
                  <Checkbox
                    checked={recurrenceRule}
                    onChange={(e) => {
                      setRecurrenceRule(e.target.checked);
                    }}
                  >
                    Repeat
                  </Checkbox>
                </div>
              </div>

              <Table
                dataSource={timeRanges}
                columns={columns}
                pagination={false}
                className="custom-table"
              />
            </div>
          </Modal>
        </Card>
      </motion.div>
    </div>
  );
}

export default Calendar;
