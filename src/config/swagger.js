const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express"); 

const apiSpecPath = path.join(__dirname, "../api-docs.yaml");
const apiSpec = yaml.load(fs.readFileSync(apiSpecPath, "utf8"));

module.exports = {
  swaggerSpec: apiSpec,
  swaggerUi,
};
