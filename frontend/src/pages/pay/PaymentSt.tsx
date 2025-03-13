import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Label, TextInput, Select } from "flowbite-react";
import {
  Table,
  TableColumnsType,
  Button as AntButton,
  Space,
  DatePicker,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";

interface Payment {
  id: number;
  amount: number;
  num_lessons: number;
  payment_method: string;
  Student: { id: number; first_name: string; last_name: string };
  class_type: { id: number; name: string };
  payment_date: string;
}

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface ClassType {
  id: number;
  name: string;
}

const PaymentComponent: React.FC = () => {
  const navigate = useNavigate();
  const { permissions, loading_1 } = usePermissions("/payments");
  const auth = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classTypes, setClassTypes] = useState<ClassType[]>([]);

  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedClassType, setSelectedClassType] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("");
  const [amount, setAmount] = useState("");
  const [numLessons, setNumLessons] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  const [loading, setLoading] = useState(false);

  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(null);

  let payMethods = ["Credit card", "PayPal", "Zelle", "CashApp"];

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
            const [paymentsRes, studentsRes, classTypesRes] = await Promise.all([
              auth.user?.role === 'student' 
                ? api.get(`/payments/student/${auth.user.id}`)
                : api.get("/payments"),
              api.get("/students"),
              api.get("/class-types"),
            ]);

            setPayments(paymentsRes.data.payments || []);
            setStudents(studentsRes.data || []);
            setClassTypes(classTypesRes.data || []);
            setLoading(false);
          } catch (error: any) {
            console.error("Error fetching data:", error);
            handleApiError(error);
            setLoading(false);
          }
        };

        fetchData();
      }
    }
  }, [permissions, navigate, loading_1]);

  const createPayment = async () => {
    if (
      !selectedStudent ||
      !selectedClassType ||
      !amount ||
      !numLessons ||
      !selectedPaymentMethod ||
      !paymentDate
    ) {
      toast.error("All fields are required.", { theme: "dark" });
      return;
    }

    try {
      const res = await api.post("/payments", {
        student_id: selectedStudent,
        class_type_id: selectedClassType,
        amount,
        num_lessons: numLessons,
        payment_method: selectedPaymentMethod,
        paymentDate: paymentDate.format("YYYY-MM-DD"),
      });

      setPayments([...res.data.payments]);

      // Reset form
      setSelectedStudent("");
      setSelectedClassType("");
      setSelectedPaymentMethod("");
      setAmount("");
      setNumLessons("");
      setPaymentDate(null);
      setOpenModal(false);

      toast.success("Payment added successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error creating payment:", error);
      handleApiError(error);
    }
  };

  const deletePayment = async (id: number) => {
    try {
      await api.delete(`/payments/${id}`);
      setPayments((prevPayments) =>
        prevPayments.filter((payment) => payment.id !== id),
      );
      toast.success("Payment deleted successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error deleting payment:", error);
      handleApiError(error);
    }
  };

  const openEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setSelectedStudent(payment.Student.id.toString());
    setSelectedClassType(payment.class_type.id.toString());
    setSelectedPaymentMethod(payment.payment_method);
    setAmount(payment.amount.toString());
    setNumLessons(payment.num_lessons.toString());
    setPaymentDate(payment.payment_date ? dayjs(payment.payment_date) : null);
    setOpenEditModal(true);
  };

  const updatePayment = async () => {
    if (!selectedPayment) return;

    try {
      const res = await api.put(`/payments/${selectedPayment.id}`, {
        student_id: selectedStudent,
        class_type_id: selectedClassType,
        amount,
        num_lessons: numLessons,
        payment_method: selectedPaymentMethod,
        paymentDate: paymentDate ? paymentDate.format("YYYY-MM-DD") : null,
      });

      setPayments([...res.data.payments]);

      setOpenEditModal(false);
      setSelectedPayment(null);
      setPaymentDate(null);
      toast.success("Payment updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating payment:", error);
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

  const downloadCSV = () => {
    if (payments.length === 0) {
      toast.error("No data available to download.", { theme: "dark" });
      return;
    }

    // Convert payment data to CSV format
    const csvData = payments.map((payment) => ({
      "Student Name": `${payment.Student.first_name} ${payment.Student.last_name}`,
      "Class Type": payment.class_type.name,
      Amount: payment.amount,
      "Number of Lessons": payment.num_lessons,
    }));

    // Convert to CSV string
    const csv = Papa.unparse(csvData);

    // Create a blob and trigger the download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "payments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        title: "Student",
        key: "student",
        render: (_: any, record: any) =>
          `${record.Student.first_name} ${record.Student.last_name}`,
        sorter: (a: any, b: any) =>
          `${a.Student.first_name} ${a.Student.last_name}`.localeCompare(
            `${b.Student.first_name} ${b.Student.last_name}`,
          ),
        ...(auth.user?.role !== 'student' && {
          filters: students
            .map((student) => ({
              text: `${student.first_name} ${student.last_name}`,
              value: `${student.first_name} ${student.last_name}`,
            }))
            .sort((a, b) => a.text.localeCompare(b.text)),
          onFilter: (value: any, record: any) =>
            `${record.Student.first_name} ${record.Student.last_name}`.includes(
              value,
            ),
        }),
      },
      {
        title: "Class Type",
        key: "class_type",
        render: (_: any, record: any) => record.class_type.name,
        sorter: (a: any, b: any) =>
          a.class_type.name.localeCompare(b.class_type.name),
      },
      {
        title: "Sum",
        dataIndex: "amount",
        key: "amount",
        sorter: (a: any, b: any) => a.amount - b.amount,
      },
      {
        title: "Lessons",
        dataIndex: "num_lessons",
        key: "num_lessons",
        sorter: (a: any, b: any) => a.num_lessons - b.num_lessons,
      },
      {
        title: "Pay with",
        dataIndex: "payment_method",
        key: "payment_method",
        sorter: (a: any, b: any) =>
          a.payment_method.localeCompare(b.payment_method),
      },
      {
        title: "Payment Date",
        key: "payment_date",
        render: (_: any, record: any) =>
          record.payment_date
            ? dayjs(record.payment_date).format("YYYY-MM-DD")
            : "-",
        sorter: (a: any, b: any) => {
          if (!a.payment_date) return -1;
          if (!b.payment_date) return 1;
          return dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix();
        },
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
                    onClick={() => openEditPayment(record)}
                    style={{ color: "white" }}
                  />
                )}
                {permissions.delete && (
                  <AntButton
                    type="text"
                    icon={<DeleteOutlined />}
                    onClick={() => deletePayment(record.id)}
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
    <Card className="max-h-[80vh]">
      <div className="custom-table shadow-md sm:rounded-lg">
        {permissions.create && (
          <button
            className="mb-3 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            type="button"
            onClick={() => {
              setOpenModal(true);
              setSelectedStudent("");
              setSelectedClassType("");
              setSelectedPaymentMethod("");
              setAmount("");
              setNumLessons("");
            }}
          >
            + Add Payment
          </button>
        )}

        {permissions.download && (
          <button
            className="mb-3 ml-2 inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-700"
            onClick={downloadCSV}
          >
            📥 Download CSV
          </button>
        )}

        <Table
          style={{ width: "70vw" }}
          className="custom-table"
          columns={columns}
          dataSource={payments.map((item, index) => ({ ...item, key: index }))}
          pagination={false}
          loading={{
            spinning: loading,
            size: "large",
          }}
          scroll={{ y: "50vh" }}
          sticky
        />
      </div>

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
              Add Payment
            </h3>

            <div>
              <Label htmlFor="student" value="Student" />
              <Select
                id="student"
                required
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">Select Student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="classType" value="Class Type" />
              <Select
                id="classType"
                required
                value={selectedClassType}
                onChange={(e) => setSelectedClassType(e.target.value)}
              >
                <option value="">Select Class Type</option>
                {classTypes.map((classType) => (
                  <option key={classType.id} value={classType.id}>
                    {classType.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="amount" value="Total Amount" />
              <TextInput
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="numLessons" value="Number of Lessons" />
              <TextInput
                id="numLessons"
                type="number"
                value={numLessons}
                onChange={(e) => setNumLessons(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="paymentMethod" value="Payment Method" />
              <Select
                id="paymentMethod"
                required
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
              >
                <option value="">Select Payment Method</option>
                {payMethods.map((methods: any, key: number) => (
                  <option key={key} value={methods}>
                    {methods}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="payment_date" value="Payment Date" />
              <DatePicker
                id="payment_date"
                size={"large"}
                style={{
                  width: "100%",
                  backgroundColor: "#374151",
                  borderColor: "#4B5563",
                  color: "white",
                }}
                value={paymentDate}
                onChange={(date) => setPaymentDate(date)}
                placeholder="Select payment date"
              />
            </div>

            <div className="flex flex-auto">
              <Button className="flex-none" onClick={createPayment}>
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

      {/* Edit Payment Modal */}
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
                Edit Payment
              </h3>

              <div>
                <Label htmlFor="student" value="Student" />
                <Select
                  id="student"
                  required
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                >
                  <option value="">Select Student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="classType" value="Class Type" />
                <Select
                  id="classType"
                  required
                  value={selectedClassType}
                  onChange={(e) => setSelectedClassType(e.target.value)}
                >
                  <option value="">Select Class Type</option>
                  {classTypes.map((classType) => (
                    <option key={classType.id} value={classType.id}>
                      {classType.name}
                    </option>
                  ))}
                </Select>
              </div>

              <Label htmlFor="amount" value="Total Amount" />
              <TextInput
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <Label htmlFor="numLessons" value="Number of Lessons" />
              <TextInput
                id="numLessons"
                type="number"
                value={numLessons}
                onChange={(e) => setNumLessons(e.target.value)}
              />

              <div>
                <Label htmlFor="paymentMethod" value="Payment Method" />
                <Select
                  id="paymentMethod"
                  required
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                >
                  <option value="">Select Payment Method</option>
                  {payMethods.map((methods: any, key: number) => (
                    <option key={key} value={methods}>
                      {methods}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label htmlFor="edit_payment_date" value="Payment Date" />
                <DatePicker
                  id="edit_payment_date"
                  size={"large"}
                  style={{
                    width: "100%",
                    backgroundColor: "#374151",
                    borderColor: "#4B5563",
                    color: "white",
                  }}
                  value={paymentDate}
                  onChange={(date) => setPaymentDate(date)}
                  placeholder="Select payment date"
                />
              </div>

              <div className="flex flex-auto">
                <Button className="flex-none" onClick={updatePayment}>
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
};

export default PaymentComponent;
