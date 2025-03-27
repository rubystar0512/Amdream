import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Label, TextInput } from "flowbite-react";
import { Table, TableColumnsType } from "antd";
import api from "../../config";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePermissions } from "../../hooks/usePermission";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../hooks/useAuth";
import moment from "moment";

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

  const columns: TableColumnsType<any> = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (text: string) => {
        return moment(text).format("DD/MM/YYYY");
      },
    },
    {
      title: "English",
      dataIndex: "english_word",
      key: "english",
      sorter: (a, b) => a.english_word.localeCompare(b.english_word),
    },
    {
      title: "Translation",
      dataIndex: "translation_word",
      key: "translation",
      sorter: (a, b) => a.translation_word.localeCompare(b.translation_word),
    },
  ];

  if (permissionsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="max-h-[80vh] w-[78vw] overflow-auto">
      <div className="overflow-x-auto shadow-md sm:rounded-lg">
        <div className="mb-4 flex items-center gap-4">
          {user?.role === "teacher" && (
            <>
              <button
                className={`inline-flex items-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium ${
                  !selectedStudent
                    ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-white text-gray-500 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                } focus:outline-none focus:ring-4 focus:ring-gray-100 dark:border-gray-600 dark:focus:ring-gray-700`}
                type="button"
                onClick={() => setOpenModal(true)}
                disabled={!selectedStudent}
              >
                Add new word
              </button>
            </>
          )}
        </div>

        {/* Show table if student is selected (for teachers) or always (for students) */}
        {
          <Table
            columns={columns}
            dataSource={words}
            pagination={false}
            loading={loading}
            className="custom-table"
            scroll={{ y: "50vh" }}
            sticky
          />
        }
      </div>

      {/* Add Word Modal */}
      <Modal
        show={openModal}
        size="md"
        onClose={() => setOpenModal(false)}
        popup
        style={{ zIndex: "1000" }}
      >
        <Modal.Header />
        <Modal.Body>
          <div className="space-y-6">
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">
              Add new word
            </h3>

            <div>
              <Label htmlFor="english" value="English:" />
              <TextInput
                id="english"
                type="text"
                required
                value={english}
                onChange={(e) => setEnglish(e.target.value)}
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
              />
            </div>

            <div className="flex flex-auto">
              <Button className="flex-none" onClick={addNewWord}>
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
    </Card>
  );
};

export default Words;
