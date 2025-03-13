const { ClassType } = require("../models");

/**
 * @desc Get all class types
 * @route GET /api/class-types
 */
exports.getAllClassTypes = async (req, res) => {
  try {
    const classTypes = await ClassType.findAll();
    res.status(200).json(classTypes);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching class types", error });
  }
};

/**
 * @desc Get a class type by ID
 * @route GET /api/class-types/:id
 */
exports.getClassTypeById = async (req, res) => {
  try {
    const classType = await ClassType.findByPk(req.params.id);
    if (!classType)
      return res.status(404).json({ msg: "Class type not found" });

    res.status(200).json(classType);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching class type", error });
  }
};

/**
 * @desc Create a new class type
 * @route POST /api/class-types
 */
exports.createClassType = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if class type already exists
    const existingClassType = await ClassType.findOne({ where: { name } });
    if (existingClassType) {
      return res.status(400).json({ msg: "Class type already exists" });
    }

    const classType = await ClassType.create({ name });
    res.status(201).json({ msg: "Class type created successfully", classType });
  } catch (error) {
    res.status(500).json({ msg: "Error creating class type", error });
  }
};

/**
 * @desc Update a class type
 * @route PUT /api/class-types/:id
 */
exports.updateClassType = async (req, res) => {
  try {
    const { name } = req.body;
    const classType = await ClassType.findByPk(req.params.id);

    if (!classType)
      return res.status(404).json({ msg: "Class type not found" });

    await classType.update({ name });
    res.status(200).json({ msg: "Class type updated successfully", classType });
  } catch (error) {
    res.status(500).json({ msg: "Error updating class type", error });
  }
};

/**
 * @desc Delete a class type
 * @route DELETE /api/class-types/:id
 */
exports.deleteClassType = async (req, res) => {
  try {
    const classType = await ClassType.findByPk(req.params.id);

    if (!classType)
      return res.status(404).json({ msg: "Class type not found" });
    await classType.destroy();

    res.status(200).json({ msg: "Class type deleted successfully", classType });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting class type", error });
  }
};
