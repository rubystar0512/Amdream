const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const csv = require("csv-writer").createObjectCsvWriter;
const cron = require("node-cron");
const path = require("path");
const colors = require("colors");

const lessonController = require("../controllers/lessonController");
const paymentController = require("../controllers/paymentController");
const studentController = require("../controllers/studentController");
const teacherController = require("../controllers/teacherController");

const key = require("../configs/key");

// Configure SendGrid with your API key
sgMail.setApiKey(key.sendgrid.api_key);

// Function to generate CSV files
async function generateReports() {
  const reports = [
    {
      name: "Lessons",
      getData: lessonController.dailyReport,
      headers: [
        { id: "id", title: "ID" },
        { id: "student_name", title: "Student Name" },
        { id: "teacher_name", title: "Teacher Name" },
        { id: "class_type", title: "Class Type" },
        { id: "class_date", title: "Class Date" },
        { id: "created_at", title: "Created At" },
        { id: "updated_at", title: "Updated At" },
      ],
    },
    {
      name: "Payments",
      getData: paymentController.dailyReport,
      headers: [
        { id: "id", title: "ID" },
        { id: "student_name", title: "Student Name" },
        { id: "class_type", title: "Class Type" },
        { id: "amount", title: "Amount" },
        { id: "num_lessons", title: "Number of Lessons" },
        { id: "payment_method", title: "Payment Method" },
        { id: "paymentDate", title: "Payment Date" },
        { id: "created_at", title: "Created At" },
        { id: "updated_at", title: "Updated At" },
      ],
    },
    {
      name: "Students",
      getData: studentController.dailyReport,
      headers: [
        { id: "id", title: "ID" },
        { id: "full_name", title: "Full Name" },
        { id: "note", title: "Note" },
        { id: "created_at", title: "Created At" },
        { id: "updated_at", title: "Updated At" },
      ],
    },
    {
      name: "Teachers",
      getData: teacherController.dailyReport,
      headers: [
        { id: "id", title: "ID" },
        { id: "full_name", title: "Full Name" },
        { id: "created_at", title: "Created At" },
        { id: "updated_at", title: "Updated At" },
      ],
    },
  ];

  for (const report of reports) {
    const csvWriter = csv({
      path: path.join(__dirname, "csv", `${report.name}.csv`),
      header: report.headers,
    });

    const data = await report.getData();
    await csvWriter.writeRecords(data);
  }
}

// Function to send email with multiple attachments
async function sendReports() {
  try {
    // First generate all reports
    await generateReports();

    const attachments = ["Students", "Teachers", "Lessons", "Payments"].map(
      (report) => ({
        content: fs
          .readFileSync(path.join(__dirname, "csv", `${report}.csv`))
          .toString("base64"),
        filename: `${report}.csv`,
        type: "text/csv",
        disposition: "attachment",
      })
    );

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const msg = {
      to: process.env.SENDGRID_RECIPIENT_EMAIL,
      from: process.env.SENDGRID_SENDER_EMAIL,
      subject: `AmDream Daily Reports - ${today}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, sans-serif; line-height: 1.6;">
          <!-- Top Banner -->
          <div style="background: linear-gradient(135deg, #6366F1 0%, #4F46E5 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 600;">Daily Reports</h1>
            <p style="color: #E0E7FF; margin-top: 8px; font-size: 18px;">${today}</p>
          </div>

          <!-- Main Content -->
          <div style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Greeting -->
            <div style="margin-bottom: 30px;">
              <h2 style="color: #1F2937; font-size: 24px; margin: 0 0 15px 0;">Hello Admin,</h2>
              <p style="color: #4B5563; font-size: 16px; margin: 0;">Your daily reports have been generated and are ready for review.</p>
            </div>

            <!-- Reports Grid -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
              <!-- Students Report Card -->
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; border-left: 4px solid #6366F1; margin-top: 20px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 28px; margin-right: 12px;">📚</span>
                  <div>
                    <h3 style="color: #1F2937; margin: 0; font-size: 18px;">Students Report</h3>
                    <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Complete student data</p>
                  </div>
                </div>
              </div>

              <!-- Teachers Report Card -->
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; border-left: 4px solid #10B981; margin-top: 20px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 28px; margin-right: 12px;">👨‍🏫</span>
                  <div>
                    <h3 style="color: #1F2937; margin: 0; font-size: 18px;">Teachers Report</h3>
                    <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Faculty information</p>
                  </div>
                </div>
              </div>

              <!-- Lessons Report Card -->
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; border-left: 4px solid #F59E0B; margin-top: 20px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 28px; margin-right: 12px;">📝</span>
                  <div>
                    <h3 style="color: #1F2937; margin: 0; font-size: 18px;">Lessons Report</h3>
                    <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Class activities</p>
                  </div>
                </div>
              </div>

              <!-- Payments Report Card -->
              <div style="background-color: #F3F4F6; padding: 20px; border-radius: 12px; border-left: 4px solid #EF4444; margin-top: 20px;">
                <div style="display: flex; align-items: center;">
                  <span style="font-size: 28px; margin-right: 12px;">💰</span>
                  <div>
                    <h3 style="color: #1F2937; margin: 0; font-size: 18px;">Payments Report</h3>
                    <p style="color: #6B7280; margin: 5px 0 0 0; font-size: 14px;">Financial summary</p>
                  </div>
                </div>
              </div>
            </div>

          <!-- Footer -->
          <div style="text-align: center; padding: 10px 0;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">Best regards,</p>
            <p style="color: #4F46E5; font-weight: 600; font-size: 16px; margin: 5px 0;">AmDream System</p>
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                This is an automated message. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
      attachments: attachments,
    };

    // Send email
    await sgMail.send(msg);
    console.log(`Reports sent successfully`.bgGreen);

    // Clean up - delete all temporary CSV files
    ["Payments", "Students", "Teachers", "Lessons"].forEach((report) => {
      fs.unlinkSync(path.join(__dirname, "csv", `${report}.csv`));
    });
  } catch (error) {
    console.error("Error sending reports:", error);
  }
}

module.exports = () =>
  cron.schedule("0 1 * * *", async () => {
    console.log(`Running reports cron job`.bgGreen);
    await sendReports();
  });
