const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  port: process.env.PORT || 5120,
  database: {
    type: process.env.DB_TYPE || "mysql",
    host: process.env.DB_HOST || "127.0.0.1",
    dbname: process.env.DB_NAME || "amdream_db",
    port: process.env.DB_PORT || "3306",
    user_name: process.env.USER_NAME || "root",
    user_pass: process.env.USER_PASS || "",
    logging: process.env.DB_LOGGING || false,
  },
  sendgrid: {
    api_key: process.env.SENDGRID_API_KEY,
    sender_email: process.env.SENDGRID_SENDER_EMAIL,
    recipient_email: process.env.SENDGRID_RECIPIENT_EMAIL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.TOKEN_EXPIRATION,
  },
  user_role: {
    student: 1,
    teacher: 2,
    accountant: 3,
    manager: 4,
    admin: 5,
  },
};
