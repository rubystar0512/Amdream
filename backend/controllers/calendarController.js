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
      recurrenceRule: timeRange.recurrenceRule,
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

        // Process each event to be added
        for (const [key, event] of added.entries()) {
          // Store the phantom ID before creating
          const phantomId = event.$PhantomId;
          const assignmentPhantomId =
            req.body?.assignments?.added?.[key]?.$PhantomId;
          
          // Get teacher ID from the event or assignment
          const teacherId = parseInt(
            event.resourceId ||
            req.body?.assignments?.added[key]?.resourceId
          );
          
          // Check if the event falls within teacher's available timerange
          const isWithinTimerange = await validateTeacherTimerange(
            teacherId,
            event.startDate,
            event.endDate
          );
          
          if (!isWithinTimerange) {
            return res.status(400).json({
              success: false,
              message: "Event cannot be scheduled outside of teacher's available timerange"
            });
          }

          // Create the calendar event
          const newEvent = await Calendar.create({
            class_type: event.class_type,
            student_id: parseInt(event.student_name),
            teacher_id: teacherId,
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
              id: newEvent.id.toString(),
            });
          }
        }

        // Add the ID mappings to the response
        if (createdEvents.length > 0) {
          responseData.events = { rows: createdEvents };
        }

        if (createdAssignments.length > 0) {
          responseData.assignments = { rows: createdAssignments };
        }
      }

      if (updated?.length) {
        // Process each event to be updated
        for (const event of updated) {
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

          // Check if start/end dates are being updated
          if (event.startDate !== undefined || event.endDate !== undefined) {
            // Get current event details to find teacher ID if not in the update
            const currentEvent = await Calendar.findByPk(event.id);
            const teacherId = event.resourceId !== undefined 
              ? parseInt(event.resourceId) 
              : currentEvent.teacher_id;
              
            // Get the start and end dates (either from updates or current values)
            const startDate = event.startDate !== undefined 
              ? event.startDate 
              : currentEvent.startDate;
            const endDate = event.endDate !== undefined 
              ? event.endDate 
              : currentEvent.endDate;
            
            // Validate against teacher's timerange
            const isWithinTimerange = await validateTeacherTimerange(
              teacherId,
              startDate,
              endDate
            );
            
            if (!isWithinTimerange) {
              return res.status(400).json({
                success: false,
                message: "Please add a timerange for this teacher"
              });
            }
          }

          // Only perform update if there are fields to update
          if (Object.keys(updateFields).length > 0) {
            await Calendar.update(updateFields, {
              where: { id: event.id },
            });
          }
        }
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

// Helper function to validate if an event falls within a teacher's available timeranges
async function validateTeacherTimerange(teacherId, startDate, endDate) {
  const { TimeAvailablity } = require('../models'); // Adjust according to your model structure
  
  // Find relevant timeranges for this teacher
  const timeRanges = await TimeAvailablity.findAll({
    where: {
      teacher_id: teacherId
    }
  });
  
  // If no timeranges exist, allow the event (or you could restrict here)
  if (timeRanges.length === 0) {
    return false;
  }
  
  // Convert event times to Date objects for comparison
  const eventStart = new Date(startDate);
  const eventEnd = new Date(endDate);
  
  // Check if the event falls within any of the teacher's timeranges
  for (const range of timeRanges) {
    const rangeStart = new Date(range.startDate);
    const rangeEnd = new Date(range.endDate);
    
    // Handle recurring timeranges
    if (range.recurrenceRule) {
      // For simplicity, let's assume weekly recurrence
      // This would need more complex logic for different recurrence patterns
      if (range.recurrenceRule === 'FREQ=WEEKLY') {
        // Check if days of week match
        if (eventStart.getDay() === rangeStart.getDay()) {
          // Check if time of day is within range (ignoring date)
          const eventTimeStart = eventStart.getHours() * 60 + eventStart.getMinutes();
          const eventTimeEnd = eventEnd.getHours() * 60 + eventEnd.getMinutes();
          const rangeTimeStart = rangeStart.getHours() * 60 + rangeStart.getMinutes();
          const rangeTimeEnd = rangeEnd.getHours() * 60 + rangeEnd.getMinutes();
          
          if (eventTimeStart >= rangeTimeStart && eventTimeEnd <= rangeTimeEnd) {
            return true;
          }
        }
      }
    } 
    // Non-recurring timerange - direct comparison
    else if (eventStart >= rangeStart && eventEnd <= rangeEnd) {
      return true;
    }
  }
  
  // If we get here, the event doesn't fall within any of the teacher's timeranges
  return false;
}

exports.addTimerange = async (req, res) => {
  try {
    const { startDate, endDate, teacher_id, recurrenceRule } = req.body;
    const timeRange = await TimeAvailablity.create({
      startDate,
      endDate,
      teacher_id,
      recurrenceRule,
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
    recurrenceRule: timeRange.recurrenceRule,
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
