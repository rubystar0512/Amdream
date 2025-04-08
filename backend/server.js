const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const https = require("https");
const http = require("http");
const fs = require("fs");
const compression = require("compression");
const color = require("colors");

const { sequelize } = require("./models");
const { port } = require("./configs/key");
const apiRouter = require("./routes");

const daily_report = require("./crons/daily_report");

const app = express();

let httpsServer;
try {
  const options = {
    key: fs.readFileSync(path.join(__dirname, "ssl", "privkey1.pem")),
    cert: fs.readFileSync(path.join(__dirname, "ssl", "fullchain.pem")),
  };
  httpsServer = https.createServer(options, app);
} catch (error) {}

const httpServer = http.createServer(app);

const startServer = async () => {
  app.use(
    cors({
      origin: "http://localhost:3333", // Your frontend URL
      credentials: true, // Enable credentials (cookies, authorization headers)
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  app.use(bodyParser.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(compression());

  app.get("/login", (req, res) => {
    console.log("Root path hit, redirecting to /login");
    return res.status(302).redirect("/ss");
  });

  app.use((err, req, res, next) => {
    if (err.code === "EBADCSRFTOKEN") {
      res.status(403).json({ msg: "CSRF Attack Detected" });
    } else if (err instanceof SyntaxError) {
      res.status(400).json({ msg: "JSON PARSER ERROR" });
    } else {
      next(err);
    }
  });

  app.use(express.static(path.join(__dirname, "public")));
  app.use("/api", apiRouter);

  app.get("*", (req, res) => {
    console.log("Catch-all route hit for path:", req.path);
    res.sendFile(path.join(__dirname, "public", "index.html"));
  });

  sequelize
    .sync({ force: false })
    .then(() => console.log("Database & tables synced"))
    .catch((err) => console.log("Error syncing database: ", err));

  if (httpsServer) {
    httpsServer.listen(port, () => {
      console.log(`HTTPS Server is running on port ${port}`.bgGreen);
    });
  } else {
    httpServer.listen(port, () => {
      console.log(`HTTP Server is running on port ${port}`.bgGreen);
    });
  }
};

daily_report();

startServer();
