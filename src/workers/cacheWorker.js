const db = require("../config/db");
const redisService = require("../services/redisService");
const config = require("../config/env");

async function startWorker() {
  try {
    console.log("Starting cache worker...");

    await db.connectMongo();
    await db.connectRedis();

    redisService.subscribeToCacheUpdates();

    console.log("Cache worker ready");
  } catch (error) {
    console.error("Failed to start worker:", error);
    process.exit(1);
  }
}

// Shared shutdown logic
async function gracefulShutdown() {
  console.log("Shutting down worker gracefully...");
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
}

// Handle shutdown signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

// Start the worker
startWorker();
