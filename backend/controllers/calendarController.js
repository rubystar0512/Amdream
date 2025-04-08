const { User, Calendar } = require("../models");
const key = require("../configs/key");

exports.getAllEvents = async (req, res) => {
  try {
    // Fetch all users who are either teachers or students
    const users = await User.findAll({
      attributes: ["id", "first_name", "last_name", "role_id"],
      where: {
        role_id: key.user_role.teacher,
      },
    });

    const resources = users.map((user) => ({
      id: user.id.toString(),
      name: `${user.first_name} ${user.last_name}`,
      eventColor: "#" + Math.floor(Math.random() * 16777215).toString(16),
    }));

    const calendarEvents = await Calendar.findAll({
      include: [
        {
          model: User,
          as: "student",
          attributes: ["first_name", "last_name"],
        },
        {
          model: User,
          as: "teacher",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    // Format events
    const events = calendarEvents.map((event) => ({
      id: event.id,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate.toISOString(),
      name: `${event.student.first_name} ${event.student.last_name} / ${event.class_type} / ${event.payment_status}`,
      student_name: event.student_id.toString(),
      resourceId: event.teacher_id.toString(),
      allDay: false,
      class_type: event.class_type,
      class_status: event.class_status,
      payment_status: event.payment_status,
      recurrenceRule: event.recurrenceRule,
    }));

    // Format the response according to the required structure
    const response = {
      success: true,
      resources: {
        rows: resources,
      },
      events: {
        rows: events,
      },
      timeRanges: {
        rows: [],
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching calendar events",
    });
  }
};

exports.saveEvents = async (req, res) => {
  try {
    if (req.body?.events) {
      const { added, updated, removed } = req.body?.events;
      if (added?.length) {
        await Promise.all(
          added.map(async (event, key) => {
            await Calendar.create({
              class_type: event.class_type,

              student_id: parseInt(event.student_name),

              teacher_id: parseInt(
                event.resourceId ||
                  req.body?.assignments?.added[key]?.resourceId
              ),

              class_status: event.class_status,

              payment_status: event.payment_status,

              startDate: event.startDate,

              endDate: event.endDate,

              recurrenceRule: event.recurrenceRule,
            });
          })
        );
      }

      if (updated?.length) {
        await Promise.all(
          updated.map(async (event) => {
            // Create an update object with only the fields that exist in the event
            const updateFields = {};

            if (event.class_type !== undefined)
              updateFields.class_type = event.class_type;
            if (event.student_name !== undefined)
              updateFields.student_id = parseInt(event.student_name);
            if (event.resourceId !== undefined)
              updateFields.teacher_id = parseInt(event.resourceId);
            if (event.class_status !== undefined)
              updateFields.class_status = event.class_status;
            if (event.payment_status !== undefined)
              updateFields.payment_status = event.payment_status;
            if (event.startDate !== undefined)
              updateFields.startDate = event.startDate;
            if (event.endDate !== undefined)
              updateFields.endDate = event.endDate;
            if (event.recurrenceRule !== undefined)
              updateFields.recurrenceRule = event.recurrenceRule;

            // Only perform update if there are fields to update
            if (Object.keys(updateFields).length > 0) {
              await Calendar.update(updateFields, {
                where: { id: event.id },
              });
            }
          })
        );
      }

      if (removed?.length) {
        await Calendar.destroy({
          where: {
            id: removed.map((event) => event.id),
          },
        });
      }

      res.json({ success: true });
    } else {
      res.json({ success: true });
    }
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({
      success: false,
      message: "Error saving calendar event",
    });
  }
};
