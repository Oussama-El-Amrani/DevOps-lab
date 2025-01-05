// Question: Pourquoi est-il important de valider les variables d'environnement au démarrage ?
// Réponse :
// Question: Que se passe-t-il si une variable requise est manquante ?
// Réponse :

const dotenv = require("dotenv");
dotenv.config();

const requiredEnvVars = ["MONGODB_URI", "MONGODB_DB_NAME", "REDIS_URI", "PORT"];

/**
 * validation of env environment variables
 */
function validateEnv() {
  requiredEnvVars.forEach((v) => {
    if (!v || !process.env[v]) throw new Error(`${v} env variable is required`);
  });
}

validateEnv();

module.exports = {
  mongodb: {
    uri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME,
  },
  redis: {
    uri: process.env.REDIS_URI,
  },
  port: process.env.PORT || 3000,
};
