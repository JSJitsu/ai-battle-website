const express = require('express');
const swaggerUi = require('swagger-ui-express');

const router = new express.Router();
const jsYaml = require('js-yaml');
const fs = require('fs');

// Our document is YAML, if yours is JSON, then you can just
// `const openApiDocument = require('spec/openapi.json')`
// instead.
const openApiDocument = jsYaml.safeLoad(fs.readFileSync('public/openapi.yaml', 'utf-8'));

// We can enable the explorer also!
const options = { explorer: true };

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(openApiDocument, options));

module.exports = router;
