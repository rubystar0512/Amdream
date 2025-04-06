import React, { useState, useEffect } from "react";
import { Button, Modal, Label, TextInput } from "flowbite-react";
import { Card, Table, TableColumnsType } from "antd";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";
import { Button as AntButton } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

interface Word {
  id: number;
  date: string;
  english: string;
  translation: string;
  teacher_id: number;
  student_id: number;
}

const Words: React.FC<{ studentId: string; studentName: string }> = ({
  studentId,
  studentName,
}) => {
  const navigate = useNavigate();
  const { permissions, loading_1: permissionsLoading } =
    usePermissions("/class/words");
  const [words, setWords] = useState<Word[]>([]);
  // const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { user } = useAuth();

  // Form states
  const [english, setEnglish] = useState("");
  const [translation, setTranslation] = useState("");
  const [editingRecord, setEditingRecord] = useState<Word | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!permissionsLoading) {
      if (user?.role != "teacher") {
        if (!permissions.read) {
          navigate("/login");
          toast.error("You don't have permission to view this page", {
            theme: "dark",
          });
        } else {
          if (user?.role === "student") {
            fetchWords(user.id);
          }
        }
      }
    }
  }, [permissions, navigate, permissionsLoading, user]);

  // Fetch words when student is selected

  useEffect(() => {
    if (studentId != "") setSelectedStudent(studentId);
  }, [studentId, studentName]);

  useEffect(() => {
    if (selectedStudent) {
      fetchWords(selectedStudent);
    } else {
      setWords([]);
    }
  }, [selectedStudent]);

  // const fetchStudents = async () => {
  //   try {
  //     const response = await api.get(`/teachers/${user?.id}/students`);
  //     setStudents(response.data || []);
  //   } catch (error: any) {
  //     console.error("Error fetching students:", error);
  //     handleApiError(error);
  //   }
  // };

  const fetchWords = async (studentId: string) => {
    try {
      setLoading(true);
      const url = `/words/${studentId}`;

      const response = await api.get(url);
      setWords(response.data || []);
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching words:", error);
      handleApiError(error);
      setLoading(false);
    }
  };

  const addNewWord = async () => {
    if (!english || !translation) {
      toast.error("Both English word and translation are required.", {
        theme: "dark",
      });
      return;
    }

    try {
      const response = await api.post("/words", {
        english_word: english,
        translation_word: translation,
        date: new Date().toISOString().split("T")[0],
        student_id: selectedStudent,
        teacher_id: user?.id,
      });

      setWords([...response.data.words]);
      setOpenModal(false);
      setEnglish("");
      setTranslation("");
      toast.success("Word added successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error adding word:", error);
      handleApiError(error);
    }
  };

  const handleApiError = (error: any) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      toast.error("Session expired. Please login again.", { theme: "dark" });
      navigate("/");
    } else {
      toast.error("An error occurred. Please try again.", { theme: "dark" });
    }
  };

  const columns: TableColumnsType<any> = (
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
        title: "Words",
        key: "words",
        fixed: "left",
        render: (obj: any) => {
          return (
            <>
              <div className="dark:red-white text-lg  text-red-400">
                {obj.english_word}
              </div>
              <div className="dark:blue-white text-lg  text-blue-400">
                {obj.translation_word}
              </div>
            </>
          );
        },
      },
    ] as TableColumnsType<any>
  ).concat(
    user?.role === "teacher"
      ? [
          {
            title: "Date",
            dataIndex: "createdAt",
            key: "date",
            sorter: (a, b) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (text: string) => {
              return (
                <span className="font-medium text-gray-900 dark:text-white">
                  {moment(text).format("DD/MM/YYYY")}
                </span>
              );
            },
          },
          {
            title: "Teacher",
            dataIndex: "Teacher",
            key: "Teacher",
            render: (obj: any) => {
              return (
                <span className="dark:text-green font-medium text-green-400">
                  {obj.first_name + " " + obj.last_name}
                </span>
              );
            },
          },
          {
            title: "Actions",
            key: "actions",
            render: (_: any, record: any) => {
              if (user?.id === record?.Teacher?.id) {
                return (
                  <AntButton
                    type="primary"
                    icon={<EditOutlined />}
                    size="small"
                    onClick={() => handleEdit(record)}
                  />
                );
              }
              return null;
            },
          },
        ]
      : [],
  );

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    setEnglish(record.english_word);
    setTranslation(record.translation_word);
    setOpenModal(true);
    setIsEditing(true);
  };

  const updateWord = async () => {
    if (!english || !translation) {
      toast.error("Both English word and translation are required.", {
        theme: "dark",
      });
      return;
    }

    try {
      const response = await api.put(`/words/${editingRecord?.id}`, {
        english_word: english,
        translation_word: translation,
        teacher_id: user?.id,
      });

      setWords(response.data.words);
      resetForm();
      setOpenModal(false);
      setIsEditing(false);
      toast.success("Word updated successfully!", { theme: "dark" });
    } catch (error: any) {
      console.error("Error updating word:", error);
      handleApiError(error);
    }
  };

  const resetForm = () => {
    setEnglish("");
    setTranslation("");
    setIsEditing(false);
    setEditingRecord(null);
  };

  if (permissionsLoading) {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="z-0 flex h-auto w-full flex-col  overflow-y-auto "
    >
      <Card
        title={
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-white">Words</span>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
          </div>
        }
        className="overflow-hidden rounded-xl border-0 shadow-lg transition-shadow hover:shadow-xl"
        headStyle={cardStyles.header}
        bodyStyle={cardStyles.body}
        extra={
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row">
            {user?.role === "teacher" && (
              <div className="flex flex-col gap-2 xs:flex-row">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium ${
                    !selectedStudent
                      ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                      : "bg-gradient-to-r from-blue-900 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => setOpenModal(true)}
                  disabled={!selectedStudent}
                >
                  + Add New Word
                </motion.button>
              </div>
            )}
          </div>
        }
      >
        <div className="custom-table overflow-hidden rounded-lg shadow-md">
          <Table
            style={{ width: "100%" }}
            columns={columns}
            dataSource={words}
            pagination={false}
            loading={{
              spinning: loading,
              size: "large",
            }}
            scroll={{ x: "max-content", y: "calc(65vh - 200px)" }}
            size="large"
            className="custom-table"
          />
        </div>
      </Card>

      {/* Add Word Modal */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => {
          setOpenModal(false);
          resetForm();
        }}
        popup
        style={{ zIndex: "1000" }}
      >
        <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
        <Modal.Body>
          <div className="space-y-4">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              {isEditing ? "Edit Word" : "Add New Word"}
            </h3>

            <div>
              <Label htmlFor="english" value="English:" />
              <TextInput
                id="english"
                type="text"
                required
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
                className="w-full rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="translation" value="Translation:" />
              <TextInput
                id="translation"
                type="text"
                required
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full rounded-lg"
              />
            </div>

            <div className="flex flex-col gap-2 pt-4 xs:flex-row">
              <Button
                className="w-full xs:w-auto"
                gradientDuoTone="purpleToBlue"
                onClick={isEditing ? updateWord : addNewWord}
              >
                {isEditing ? "Update" : "Add"}
              </Button>
              <Button
                className="w-full xs:w-auto"
                color="gray"
                onClick={() => {
                  setOpenModal(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </motion.div>
  );
};

export default Words;
