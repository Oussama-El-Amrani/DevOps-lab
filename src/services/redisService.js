// Question : Comment gérer efficacement le cache avec Redis ?
// Réponse :
// Question: Quelles sont les bonnes pratiques pour les clés Redis ?
// Réponse :
const { getRedisClient } = require("../config/db");
const mongoService = require("./mongoService");
/**
 * Caches data in Redis with a specified time-to-live (TTL).
 *
 * @async
 * @param {string} key - The key under which the data will be stored in Redis.
 * @param {Object} data - The data to be cached. It will be stringified before storing.
 * @param {number} ttl - Time-to-live for the cache in seconds.
 * @returns {Promise<void>} Resolves when the data is successfully cached.
 * @throws {Error} Throws an error if caching fails.
 */
async function cacheData(key, data, ttl) {
  try {
    const stringifiedData = JSON.stringify(data);

    await getRedisClient().set(key, stringifiedData, {
      EX: ttl,
    });

    console.log(`Data cached with key: ${key}`);
  } catch (error) {
    console.error(`Error caching data with key: ${key}`, error);
    throw new Error(`Failed to cache data: ${error.message}`);
  }
}

/**
 * Retrieves cached data from Redis by key.
 *
 * @async
 * @param {string} key - The key to retrieve data for.
 * @returns {Promise<Object|null>} The cached data as a parsed object, or `null` if the key does not exist.
 * @throws {Error} Throws an error if retrieval fails.
 */
async function getCachedData(key) {
  try {
    const data = await getRedisClient().get(key);

    if (!data) {
      console.log(`No cached data found for key: ${key}`);
      return null;
    }

    const parsedData = JSON.parse(data);
    console.log(`Data retrieved from cache for key: ${key}`);

    return parsedData;
  } catch (error) {
    console.error(`Error caching data with key: ${key}`, error);
    throw new Error(`Failed to cache data: ${error.message}`);
  }
}

async function publishCacheUpdateEvent(key) {
  try {
    await getRedisClient().publish("cache:update", key);
    console.log(`Published cache update for key: ${key}`);
  } catch (error) {
    console.error(`Error publishing event for key ${key}:`, error);
    throw error;
  }
}

function subscribeToCacheUpdates() {
  const subscriber = getRedisClient().duplicate();
  subscriber.subscribe("cache:update", (err) => {
    if (err) throw err;
    console.log("Subscribed to cache updates");
  });

  subscriber.on("message", async (channel, key) => {
    if (channel === "cache:update") {
      console.log(`Updating cache for key: ${key}`);
      try {
        const data = await mongoService.findAll(getDb().collection("courses"));
        await cacheData(key, data, 3600);
      } catch (error) {
        console.error(`Cache update failed for ${key}:`, error);
      }
    }
  });
}

/**
 * Caches a document in Redis Hash structure
 * @param {string} collectionName - Name of the collection (e.g., 'students', 'courses')
 * @param {string} documentId - Unique identifier for the document
 * @param {Object} documentData - Document data to store
 * @param {number} ttl - Time-to-live in seconds (default: 1 hour)
 */
async function cacheHashDocument(
  collectionName,
  documentId,
  documentData,
  ttl = 3600
) {
  try {
    const key = `${collectionName}:hash`;
    await getRedisClient()
      .multi()
      .hSet(key, documentId, JSON.stringify(documentData))
      .expire(key, ttl)
      .exec();
  } catch (error) {
    console.error(`Error caching ${collectionName} hash:`, error);
    throw error;
  }
}

/**
 * Retrieves a single document from Redis Hash
 * @param {string} collectionName - Name of the collection
 * @param {string} documentId - ID of the document to retrieve
 */
async function getHashDocument(collectionName, documentId) {
  try {
    const key = `${collectionName}:hash`;
    const data = await getRedisClient().hGet(key, documentId);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting ${collectionName} hash document:`, error);
    throw error;
  }
}

/**
 * Retrieves all documents from a Redis Hash collection
 * @param {string} collectionName - Name of the collection
 */
async function getAllHashDocuments(collectionName) {
  try {
    const key = `${collectionName}:hash`;
    const data = await getRedisClient().hGetAll(key);
    return Object.entries(data).map(([id, value]) => ({
      _id: id,
      ...JSON.parse(value),
    }));
  } catch (error) {
    console.error(`Error getting all ${collectionName} hash documents:`, error);
    throw error;
  }
}

module.exports = {
  cacheData,
  getCachedData,
  publishCacheUpdateEvent,
  subscribeToCacheUpdates,
  cacheHashDocument,
  getAllHashDocuments,
  getHashDocument,
};
