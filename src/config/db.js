// Question : Pourquoi créer un module séparé pour les connexions aux bases de données ?
// Réponse : 
// Question : Comment gérer proprement la fermeture des connexions ?
// Réponse : 

const { MongoClient, Db } = require("mongodb");
MongoClient;
const redis = require("redis");
const config = require("./env");
/**
 * @type {MongoClient} mongoClient
 */
let mongoClient;
let redisClient;
/**
 * @type {Db} db
 */
let db;

async function connectMongo() {
  // Gérer les erreurs et les retries
  try {
    mongoClient = new MongoClient(config.mongodb.uri);

    await mongoClient.connect();

    db = mongoClient.db(config.mongodb.dbName);
    console.log("✅ MongoDB Connected");

    return db;
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

async function closeMongo() {
  if (mongoClient) {
    await mongoClient.close();
    console.log("MongoDB connection Closed");
  }
}

/**
 *
 * @returns  @type {Db} db
 */
function getDb() {
  if (!db) throw new Error("Database not initialized. Call connectMongo first");

  return db;
}
/**
 * Connects to the Redis server and establishes a persistent connection.
 *
 * @async
 * @returns {Promise<ReturnType<require("redis").createClient>>} Redis client instance.
 * @throws {Error} Throws an error if connection fails.
 */
async function connectRedis() {
  try {
    redisClient = redis.createClient({ url: config.redis.uri });

    await redisClient.connect();
    await redisClient.ping();

    console.log("✅ Redis Connected");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

/**
 * Retrieves the Redis client instance.
 *
 * @function
 * @returns {ReturnType<require("redis").createClient>} The connected Redis client instance.
 * @throws {Error} Throws an error if Redis is not connected yet.
 */
function getRedisClient() {
  if (!redisClient)
    throw new Error("Redis not connected yet. call connectRedis first");

  return redisClient;
}

/**
 * Closes the Redis connection .
 *
 * @async
 * @returns {Promise<void>} Resolves when the Redis connection is successfully closed.
 * @throws {Error} Throws an error if closing the Redis connection fails.
 */
async function closeRedis() {
  try {
    if (redisClient) await redisClient.quit();
    console.log("Redis connection closed");
  } catch (error) {
    console.error("Error closing Redis connection", error);
  }
}

// Export des fonctions et clients
module.exports = {
  getDb,
  connectMongo,
  closeMongo,
  connectRedis,
  getRedisClient,
  closeRedis,
};