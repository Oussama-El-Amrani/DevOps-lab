// Question: Comment organiser le point d'entrée de l'application ?
// Question: Quelle est la meilleure façon de gérer le démarrage de l'application ?

const express = require("express");
const config = require("./config/env");
const db = require("./config/db");

const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const requestTimer = require("./middlewares/requestTimer");
const { swaggerSpec, swaggerUi } = require("./config/swagger");

const app = express();

app.use(requestTimer);
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/courses", courseRoutes);
app.use("/api/students", studentRoutes);
async function startServer() {
  try {
    console.log("start server");

    await db.connectMongo();
    await db.connectRedis();

    app.listen(config.port, () => {
      console.log(`listening on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Gestion propre de l'arrêt
process.on("SIGTERM", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  try {
    await db.closeMongo();
    console.log("MongoDB connection closed.");

    await db.closeRedis();
    console.log("Redis connection closed.");

    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
});

startServer();
