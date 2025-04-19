import React from "react";
import { Button, Modal, Label, TextInput, Textarea } from "flowbite-react";
import { useClassModal } from "../../contexts/ClassModalContext";

interface Props {
  onSubmit: () => void;
}

const AddEditClassModal: React.FC<Props> = ({ onSubmit }) => {
  const { isOpen, isEditing, formData, updateField, closeModal } =
    useClassModal();

  return (
    <Modal
      show={isOpen}
      size="md"
      onClose={closeModal}
      popup
      style={{ zIndex: "1000" }}
    >
      <Modal.Header className="border-b border-gray-200 dark:border-gray-700" />
      <Modal.Body>
        <div className="space-y-4">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white">
            {isEditing ? "Edit class info" : "Add new class info"}
          </h3>

          <div>
            <Label htmlFor="date" value="Date:" />
            <TextInput
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => updateField("date", e.target.value)}
              className="w-full rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="course" value="Course:" />
            <TextInput
              id="course"
              type="text"
              required
              value={formData.course}
              onChange={(e) => updateField("course", e.target.value)}
              className="w-full rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="unit" value="Unit:" />
            <TextInput
              id="unit"
              type="text"
              required
              value={formData.unit}
              onChange={(e) => updateField("unit", e.target.value)}
              className="w-full rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="can-do" value="Can-do:" />
            <TextInput
              id="can-do"
              type="text"
              required
              value={formData.canDo}
              onChange={(e) => updateField("canDo", e.target.value)}
              className="w-full rounded-lg"
            />
          </div>

          <div>
            <Label htmlFor="notes" value="Notes:" />
            <Textarea
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              className="w-full rounded-lg"
            />
          </div>

          <div className="flex flex-col gap-2 pt-4 xs:flex-row">
            <Button
              className="w-full xs:w-auto"
              gradientDuoTone="purpleToBlue"
              onClick={onSubmit}
            >
              {isEditing ? "Update" : "Add"}
            </Button>
            <Button
              className="w-full xs:w-auto"
              color="gray"
              onClick={closeModal}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AddEditClassModal;
