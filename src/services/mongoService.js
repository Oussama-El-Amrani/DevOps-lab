// Question: Pourquoi créer des services séparés ?
// Réponse: 

const { ObjectId, Collection } = require("mongodb");

// Fonctions utilitaires pour MongoDB
/**
 *
 * @param {Collection<Document>} collection
 * @param {ObjectId} id
 * @returns
 */
async function findOneById(collection, id) {
  return await collection.findOne({ _id: new ObjectId(id) });
}

/**
 *
 * @param {Collection<Document>} collection
 * @param {ObjectId} id
 * @returns
 */
async function findAll(collection) {
  return await collection.find().toArray();
}

/**
 *
 *
 * @param {Collection<Document>} collection
 * @param {*} document
 */
async function createDocument(collection, document) {
  return await collection.insertOne(document);
}

// Export des services
module.exports = {
  findOneById,
  findAll,
  createDocument,
};