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

async function connectRedis() {
  // TODO: Implémenter la connexion Redis
  // Gérer les erreurs et les retries
}

// Export des fonctions et clients
module.exports = {
  // TODO: Exporter les clients et fonctions utiles
};