import {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

// Define the structure of the modal form
interface FormData {
  date: string;
  course: string;
  unit: string;
  canDo: string;
  notes: string;
}

// Define the context value type
interface ClassModalContextProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormData;
  editingRecord: any;
  openModal: (data?: Partial<FormData>, editMode?: boolean) => void;
  closeModal: () => void;
  updateField: (field: keyof FormData, value: string) => void;
  resetForm: () => void;
  setEditingRecord: Dispatch<SetStateAction<any>>;
}

const defaultFormData: FormData = {
  date: "",
  course: "",
  unit: "",
  canDo: "",
  notes: "",
};

// Create context
const ClassModalContext = createContext<ClassModalContextProps | undefined>(
  undefined,
);

// Create provider
export const ClassModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [editingRecord, setEditingRecord] = useState<any>(null);

  const openModal = (
    data: Partial<FormData> = {},
    editMode: boolean = false,
  ) => {
    setFormData({ ...defaultFormData, ...data });
    setIsEditing(editMode);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setIsEditing(false);
    setEditingRecord(null);
    setFormData(defaultFormData);
  };

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setEditingRecord(null);
  };

  return (
    <ClassModalContext.Provider
      value={{
        isOpen,
        isEditing,
        formData,
        editingRecord,
        openModal,
        closeModal,
        updateField,
        resetForm,
        setEditingRecord,
      }}
    >
      {children}
    </ClassModalContext.Provider>
  );
};

// Create hook for consuming the context
export const useClassModal = () => {
  const context = useContext(ClassModalContext);
  if (!context) {
    throw new Error("useClassModal must be used within a ClassModalProvider");
  }
  return context;
};
