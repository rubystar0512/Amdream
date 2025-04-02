import { useState, useEffect } from "react";
import { Card, DatePicker, Button, Table, TableColumnsType } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import type { Dayjs } from "dayjs";
import { motion } from "framer-motion";
import api from "../../config";
import { useAuth } from "../../hooks/useAuth";

const { RangePicker } = DatePicker;

interface ClassState {
  name: string;
  total_classes: number;
  paid_classes: number;
  unpaid_classes: number;
}

interface TeacherSalary {
  name: string;
  class_type_stats: {
    class_type: string;
    total_classes_taught: number;
    total_salary: string;
  }[];
}

// Update cardStyles to be more responsive
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
    maxHeight: "80vh",
    "@media (min-width: 640px)": {
      padding: "20px",
    },
  },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [classStateData, setStateTypeData] = useState<ClassState[]>([]);
  const [teacherSalaryData, setTeacherSalaryData] = useState<TeacherSalary[]>(
    [],
  );
  const [classType, setClassTypeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    null,
    null,
  ]);
  const auth = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (auth.user?.role === "student") {
          // Only fetch specific student's data
          const res = await api.get(`/students/${auth.user.id}/class-stats`);
          setStateTypeData(res.data || []); // Wrap in array since we're expecting single student data
        } else if (
          auth.user?.role === "admin" ||
          auth.user?.role === "manager" ||
          auth.user?.role === "accountant"
        ) {
          // Fetch all students data
          const res = await api.get("/students/class-stats");
          setStateTypeData(res.data || []);
        }

        if (auth.user?.role === "teacher") {
          // Only fetch specific teacher's salary data
          const res1 = await api.put(`/teachers/${auth.user.id}/salary`);
          setTeacherSalaryData(res1.data || []); // Wrap in array since we're expecting single teacher data
        } else if (
          auth.user?.role === "admin" ||
          auth.user?.role === "accountant"
        ) {
          // Fetch all teachers data
          const res1 = await api.post("/teachers/salary");
          setTeacherSalaryData(res1.data || []);
        }

        if (
          auth.user?.role === "admin" ||
          auth.user?.role === "teacher" ||
          auth.user?.role === "accountant"
        ) {
          const res2 = await api.get("/class-types");
          setClassTypeData(res2.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        handleApiError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate, auth.user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = {
          start_date: (dateRange && dateRange[0]?.format("YYYY-MM-DD")) || null,
          end_date: (dateRange && dateRange[1]?.format("YYYY-MM-DD")) || null,
        };

        if (auth.user?.role === "teacher") {
          // Only fetch specific teacher's salary data
          const res = await api.put(`/teachers/${auth.user.id}/salary`, data);
          setTeacherSalaryData(res.data || []);
        } else if (
          auth.user?.role === "admin" ||
          auth.user?.role === "accountant"
        ) {
          // Fetch all teachers data
          const res = await api.post("/teachers/salary", data);
          setTeacherSalaryData(res.data || []);
        }
      } catch (error: any) {
        console.error("Error fetching salary data:", error);
        handleApiError(error);
      }
    };

    fetchData();
  }, [dateRange, auth.user]);

  const handleApiError = (error: any) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        toast.error("Session expired. Please login again.", { theme: "dark" });
        navigate("/");
      } else {
        toast.error("Please try again.", { theme: "dark" });
      }
    } else {
      toast.error("Network error. Please check your connection.", {
        theme: "dark",
      });
    }
  };

  // ✅ Function to Download CSV File
  const downloadCSV = () => {
    if (teacherSalaryData.length === 0) {
      toast.error("No data available to download.", { theme: "dark" });
      return;
    }

    // Convert teacher salary data to CSV format
    const csvData = teacherSalaryData.map((teacher) => {
      let row: any = {
        "Teacher Name": teacher.name,
      };

      // Add class type columns dynamically
      classType.forEach((type) => {
        const classStat = teacher?.class_type_stats?.find(
          (stat: any) => stat.class_type === type.name,
        );
        row[type.name] = classStat
          ? `${classStat.total_classes_taught} ($${classStat.total_salary})`
          : "0 ($0.00)";
      });

      // Add total salary
      row["Total Salary"] = `$${teacher?.class_type_stats
        ?.reduce(
          (sum: number, stat: any) => sum + parseFloat(stat.total_salary),
          0,
        )
        .toFixed(2)}`;

      return row;
    });

    // Convert to CSV string
    const csv = Papa.unparse(csvData);

    // Create a blob and trigger the download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "teacher_salaries.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const classStateColumns: TableColumnsType<ClassState> = [
    {
      title: "No",
      key: "index",
      width: "10%",
      fixed: "left",
      render: (_: any, __: any, index: number) => (
        <span className="text-gray-600 dark:text-gray-400">{index + 1}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      fixed: "left",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {text}
        </span>
      ),
    },
    {
      title: "Classes Paid",
      dataIndex: "total_classes",
      key: "total_classes",
      sorter: (a, b) => a.total_classes - b.total_classes,
      render: (value: number) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          {value}
        </span>
      ),
    },
    {
      title: "Classes Taken",
      dataIndex: "paid_classes",
      key: "paid_classes",
      sorter: (a, b) => a.paid_classes - b.paid_classes,
      render: (value: number) => (
        <span className="font-medium text-green-600 dark:text-green-400">
          {value}
        </span>
      ),
    },
    {
      title: "Classes Left",
      dataIndex: "unpaid_classes",
      key: "unpaid_classes",
      sorter: (a, b) => a.unpaid_classes - b.unpaid_classes,
      filters: [
        { text: "Negative Balance", value: "negative" },
        { text: "No Classes Left", value: "zero" },
        { text: "One Class Left", value: "one" },
        { text: "Multiple Classes", value: "multiple" },
      ],
      onFilter: (value, record) => {
        switch (value) {
          case "negative":
            return record.unpaid_classes < 0;
          case "zero":
            return record.unpaid_classes === 0;
          case "one":
            return record.unpaid_classes === 1;
          case "multiple":
            return record.unpaid_classes > 1;
          default:
            return true;
        }
      },
      render: (unpaid_classes: number) => ({
        props: {
          style: {
            color:
              unpaid_classes <= 0
                ? "#ef4444"
                : unpaid_classes === 1
                  ? "#eab308"
                  : "#22c55e",
          },
        },
        children: <span className="font-medium">{unpaid_classes}</span>,
      }),
    },
  ];

  const teacherSalaryColumns: TableColumnsType<TeacherSalary> = [
    {
      title: "No",
      key: "index",
      width: "10%",
      fixed: "left",
      render: (_: any, __: any, index: number) => (
        <span className="text-gray-600 dark:text-gray-400">{index + 1}</span>
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      fixed: "left",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text: string) => (
        <span className="font-medium text-gray-900 dark:text-white">
          {text}
        </span>
      ),
    },
    ...classType.map((type) => ({
      title: type.name,
      key: type.name,
      render: (_: any, record: any) => {
        const classStat = record.class_type_stats?.find(
          (stat: any) => stat.class_type === type.name,
        );
        return (
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {classStat
              ? `${classStat.total_classes_taught} ($${classStat.total_salary})`
              : "0 ($0.00)"}
          </span>
        );
      },
    })),
    {
      title: "Total",
      key: "total",
      render: (_, record) => (
        <span className="font-medium text-blue-600 dark:text-blue-400">
          $
          {record.class_type_stats
            ?.reduce((sum, stat) => sum + parseFloat(stat.total_salary), 0)
            .toFixed(2)}
        </span>
      ),
      sorter: (a, b) => {
        const totalA = a.class_type_stats?.reduce(
          (sum, stat) => sum + parseFloat(stat.total_salary),
          0,
        );
        const totalB = b.class_type_stats?.reduce(
          (sum, stat) => sum + parseFloat(stat.total_salary),
          0,
        );
        return totalA - totalB;
      },
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex w-full flex-col gap-4 overflow-y-auto p-3 md:gap-6 md:p-6"
    >
      {/* Header Section with Date Range and Export */}
      <div className="mb-2 flex flex-col items-start justify-between gap-3 rounded-xl bg-white p-3 shadow-lg dark:bg-gray-800 sm:flex-row sm:items-center md:mb-4 md:p-4">
        <div className="xs:flex-row xs:items-center flex w-full flex-col items-start gap-3 sm:w-auto">
          <RangePicker
            onChange={(dates) =>
              setDateRange(dates as [Dayjs | null, Dayjs | null])
            }
            className="xs:w-auto w-full rounded-lg shadow-sm hover:border-blue-400 focus:border-blue-500"
          />
          <Button
            type="default"
            onClick={() => setDateRange([null, null])}
            className="xs:w-auto w-full rounded-lg border-gray-200 font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300"
          >
            Reset
          </Button>
        </div>

        {(auth.user?.role === "admin" || auth.user?.role === "accountant") && (
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full sm:w-auto"
          >
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={downloadCSV}
              className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 font-medium shadow-lg transition-all hover:from-blue-700 hover:to-indigo-700"
            >
              Export Data
            </Button>
            <div className="absolute -bottom-1 left-0 right-0 h-1 animate-pulse rounded-full bg-blue-400/30" />
          </motion.div>
        )}
      </div>

      {/* Class State Table */}
      {(auth.user?.role === "student" ||
        auth.user?.role === "admin" ||
        auth.user?.role === "manager" ||
        auth.user?.role === "accountant") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full overflow-hidden"
        >
          <Card
            title={
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">
                  Class State
                </span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              </div>
            }
            className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
            headStyle={cardStyles.header}
            bodyStyle={cardStyles.body}
          >
            <Table
              columns={classStateColumns}
              dataSource={classStateData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              loading={loading}
              pagination={false}
              className="custom-table"
              scroll={{ x: "30vw", y: "calc(55vh - 120px)" }}
              size="large"
            />
          </Card>
        </motion.div>
      )}

      {/* Teacher Salary Table */}
      {(auth.user?.role === "teacher" ||
        auth.user?.role === "admin" ||
        auth.user?.role === "accountant") && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full overflow-hidden"
        >
          <Card
            title={
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-white">
                  Teacher Salary
                </span>
                <div className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
              </div>
            }
            className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
            headStyle={cardStyles.header}
            bodyStyle={cardStyles.body}
          >
            <Table
              columns={teacherSalaryColumns}
              dataSource={teacherSalaryData.map((item, index) => ({
                ...item,
                key: index,
              }))}
              loading={loading}
              pagination={false}
              className="custom-table"
              scroll={{ x: "max-content", y: "calc(55vh - 120px)" }}
              size="large"
            />
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
