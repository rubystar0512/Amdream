const { User, Calendar, TimeAvailablity } = require("../models");
const key = require("../configs/key");

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to hex color
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }

  return color;
};

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
      eventColor: stringToColor(`${user.first_name} ${user.last_name}`),
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
      name: `${event.student.first_name} ${event.student.last_name} / ${
        event.class_type || "Not assigned"
      } / ${event.payment_status || "Not assigned"}`,
      student_name: event.student_id.toString(),
      resourceId: event.teacher_id.toString(),
      allDay: false,
      class_type: event.class_type,
      class_status: event.class_status,
      payment_status: event.payment_status,
      recurrenceRule: event.recurrenceRule,
    }));

    const timeRangesRawData = await TimeAvailablity.findAll({
      include: [
        {
          model: User,
          as: "Teacher",
          attributes: ["first_name", "last_name"],
        },
      ],
    });

    const timeRanges = timeRangesRawData.map((timeRange) => ({
      id: timeRange.id,
      teacher_id: timeRange.teacher_id,
      startDate: timeRange.startDate.toISOString(),
      endDate: timeRange.endDate.toISOString(),
      name: `${timeRange.Teacher.first_name} ${timeRange.Teacher.last_name} 's availability`,
      color: stringToColor(
        `${timeRange.Teacher.first_name} ${timeRange.Teacher.last_name}`
      ),
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
        rows: timeRanges,
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
      const responseData = { success: true };

      if (added?.length) {
        // Track created events to map phantom IDs to real IDs
        const createdEvents = [];
        const createdAssignments = [];

        await Promise.all(
          added.map(async (event, key) => {
            // Store the phantom ID before creating
            const phantomId = event.$PhantomId;
            const assignmentPhantomId =
              req.body?.assignments?.added?.[key]?.$PhantomId;

            // Create the calendar event
            const newEvent = await Calendar.create({
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

            // Map phantom ID to real ID for events
            if (phantomId) {
              createdEvents.push({
                $PhantomId: phantomId,
                id: newEvent.id.toString(),
              });
            }

            // Map phantom ID to real ID for assignments if they exist
            if (assignmentPhantomId) {
              createdAssignments.push({
                $PhantomId: assignmentPhantomId,
                id: newEvent.id.toString(), // or another ID if assignments have their own IDs
              });
            }
          })
        );

        // Add the ID mappings to the response
        if (createdEvents.length > 0) {
          responseData.events = { rows: createdEvents };
        }

        if (createdAssignments.length > 0) {
          responseData.assignments = { rows: createdAssignments };
        }
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

      res.json(responseData);
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

exports.addTimerange = async (req, res) => {
  try {
    const { startDate, endDate, teacher_id } = req.body;
    const timeRange = await TimeAvailablity.create({
      startDate,
      endDate,
      teacher_id,
    });
    res.status(200).json({ success: true, timeRange });
  } catch (error) {
    console.error("Error adding timerange:", error);
    res.status(500).json({
      success: false,
      message: "Error adding timerange",
    });
  }
};

exports.getTimeranges = async (req, res) => {
  const timeRangesRawData = await TimeAvailablity.findAll({
    include: [
      {
        model: User,
        as: "Teacher",
        attributes: ["first_name", "last_name"],
      },
    ],
  });

  const timeRanges = timeRangesRawData.map((timeRange) => ({
    id: timeRange.id,
    teacher_id: timeRange.teacher_id,
    startDate: timeRange.startDate.toISOString(),
    endDate: timeRange.endDate.toISOString(),
    name: `${timeRange.Teacher.first_name} ${timeRange.Teacher.last_name} 's availability`,
    color: stringToColor(
      `${timeRange.Teacher.first_name} ${timeRange.Teacher.last_name}`
    ),
  }));
  res.status(200).json({ success: true, timeRanges });
};

exports.deleteTimerange = async (req, res) => {
  try {
    const { id } = req.params;
    await TimeAvailablity.destroy({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Timerange deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timerange:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting timerange",
    });
  }
};
