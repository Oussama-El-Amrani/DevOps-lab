// Question : Comment gérer efficacement le cache avec Redis ?
// Réponse :
// Question: Quelles sont les bonnes pratiques pour les clés Redis ?
// Réponse :
const { getRedisClient } = require("../config/db");

// Fonctions utilitaires pour Redis
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

module.exports = {
  cacheData,
  getCachedData,
};
