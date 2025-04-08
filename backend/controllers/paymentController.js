const moment = require("moment");

const { Payment, User, ClassType } = require("../models");
const { user_role } = require("../configs/key");
/**
 * @desc Get all payments with student and class type details
 * @route GET /api/payments
 */
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
        },
        { model: ClassType, attributes: ["id", "name"] },
      ],
    });
    res.status(200).json({ msg: "Payments fetched successfully", payments });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching payments", error });
  }
};

/**
 * @desc Get a single payment by ID
 * @route GET /api/payments/:id
 */
exports.getPaymentById = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { student_id: req.params.id },
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
        },
        { model: ClassType, attributes: ["name"] },
      ],
    });

    if (!payments) return res.status(404).json({ msg: "Payment not found" });

    res.status(200).json({ msg: "Payment fetched successfully", payments });
  } catch (error) {
    res.status(500).json({ msg: "Error fetching payment", error });
  }
};

/**
 * @desc Create a new payment
 * @route POST /api/payments
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      student_id,
      class_type_id,
      amount,
      num_lessons,
      payment_method,
      paymentDate,
    } = req.body;

    // Check if student and class type exist
    const student = await User.findByPk(student_id);
    const classType = await ClassType.findByPk(class_type_id);

    if (!student) return res.status(404).json({ msg: "Student not found" });
    if (!classType)
      return res.status(404).json({ msg: "Class type not found" });

    // Create the payment
    const payment = await Payment.create({
      student_id,
      class_type_id,
      amount,
      num_lessons,
      payment_method,
      payment_date: paymentDate,
    });

    const payments = await Payment.findAll({
      include: [
        {
          model: User,
          as: "Student",
          attributes: ["id", "first_name", "last_name"],
          where: { role_id: user_role.student },
        },
        { model: ClassType, attributes: ["id", "name"] },
      ],
    });

    res.status(201).json({ msg: "Payment created successfully", payments });
  } catch (error) {
    res.status(500).json({ msg: "Error creating payment", error });
  }
};

/**
 * @desc Update a payment
 * @route PUT /api/payments/:id
 */
exports.updatePayment = async (req, res) => {
  try {
    const {
      student_id,
      class_type_id,
      amount,
      num_lessons,
      payment_method,
      paymentDate,
    } = req.body;
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    await payment.update({
      student_id,
      class_type_id,
      amount,
      num_lessons,
      payment_method,
      paymentDate,
    });

    res.status(200).json({ msg: "Payment updated successfully", payment });
  } catch (error) {
    res.status(500).json({ msg: "Error updating payment", error });
  }
};

/**
 * @desc Delete a payment
 * @route DELETE /api/payments/:id
 */
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);

    if (!payment) return res.status(404).json({ msg: "Payment not found" });

    await payment.destroy();

    res.status(200).json({ msg: "Payment deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting payment", error });
  }
};

exports.dailyReport = async () => {
  try {
    const payments = await Payment.findAll({
      include: [
        { model: User, as: "Student", attributes: ["first_name", "last_name"] },
        { model: ClassType, attributes: ["name"] },
      ],
    });

    return payments.map((payment, key) => ({
      id: key + 1,
      student_name: `${payment.Student.first_name} ${payment.Student.last_name}`,
      class_type: payment.class_type.name,
      amount: payment.amount,
      num_lessons: payment.num_lessons,
      payment_method: payment.payment_method,
      paymentDate: moment(payment.paymentDate).format("DD/MM/YYYY"),
    }));
  } catch (error) {
    console.log("Error fetching payments", error);
  }
};
