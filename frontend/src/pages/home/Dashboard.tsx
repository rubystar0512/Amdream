import { useState, useEffect } from "react";
import { Card, DatePicker, Button } from "antd";
import { Table, TableColumnsType } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import type { Dayjs } from "dayjs";
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
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Classes paid",
      dataIndex: "total_classes",
      key: "total_classes",
      sorter: (a, b) => a.total_classes - b.total_classes,
    },
    {
      title: "Classes taken",
      dataIndex: "paid_classes",
      key: "paid_classes",
      sorter: (a, b) => a.paid_classes - b.paid_classes,
    },
    {
      title: "Classes left",
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
                  : "inherit",
          },
        },
        children: unpaid_classes,
      }),
    },
  ];

  const teacherSalaryColumns: TableColumnsType<TeacherSalary> = [
    {
      title: "No",
      key: "index",
      width: "10%",
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    ...classType.map((type) => ({
      title: type.name,
      key: type.name,
      render: (_: any, record: any) => {
        const classStat = record.class_type_stats?.find(
          (stat: any) => stat.class_type === type.name,
        );
        return classStat
          ? `${classStat.total_classes_taught} ($${classStat.total_salary})`
          : "0 ($0.00)";
      },
    })),
    {
      title: "Total",
      key: "total",
      render: (_, record) =>
        `$${record.class_type_stats
          ?.reduce((sum, stat) => sum + parseFloat(stat.total_salary), 0)
          .toFixed(2)}`,
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
    <div className="flex max-h-[80vh] w-[80vw] flex-col gap-2">
      {(auth.user?.role === "student" ||
        auth.user?.role === "admin" ||
        auth.user?.role === "manager" ||
        auth.user?.role === "accountant") && (
        <Card
          title="Class State"
          className={`h-[40vh] w-[82vw]`}
          headStyle={{
            color: "white",
            background: "#1E293B", // Darker blue-gray
            borderBottom: "1px solid #334155", // Darker border
          }}
          bodyStyle={{
            background: "transparent",
          }}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: "8px", // Add rounded corners
          }}
        >
          <Table
            className="custom-table"
            columns={classStateColumns}
            dataSource={classStateData.map((item, index) => ({
              ...item,
              key: index,
            }))}
            bordered
            pagination={false}
            style={{
              borderColor: "#334155",
            }}
            loading={{
              spinning: loading,
              size: "large",
            }}
            scroll={{ y: "24vh" }} // Adjust scroll height to account for header
          />
        </Card>
      )}

      {(auth.user?.role === "teacher" ||
        auth.user?.role === "admin" ||
        auth.user?.role === "accountant") && (
        <Card
          className="h-[40vh] w-[82vw]"
          headStyle={{
            color: "white",
            background: "#1E293B",
            borderBottom: "1px solid #334155",
          }}
          bodyStyle={{
            background: "transparent",
          }}
          style={{
            background: "transparent",
            border: "1px solid #334155",
            borderRadius: "8px",
          }}
          title={
            <div className="flex items-center justify-between gap-2">
              <span>Teacher Salary</span>
              <div className="flex items-center gap-2">
                <RangePicker
                  onChange={(dates) =>
                    setDateRange(dates as [Dayjs | null, Dayjs | null])
                  }
                  value={dateRange}
                  style={{
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    color: "white",
                  }}
                />
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  onClick={downloadCSV}
                  style={{
                    backgroundColor: "#1E293B",
                    borderColor: "#334155",
                    color: "white",
                  }}
                >
                  Download CSV
                </Button>
              </div>
            </div>
          }
        >
          <Table
            className="custom-table"
            bordered
            columns={teacherSalaryColumns}
            dataSource={teacherSalaryData.map((item, index) => ({
              ...item,
              key: index,
            }))}
            pagination={false}
            loading={{
              spinning: loading,
              size: "large",
            }}
            style={{
              borderColor: "#334155",
              width: "100vw",
            }}
            scroll={{ y: "24vh" }}
          />
        </Card>
      )}
    </div>
  );
}
