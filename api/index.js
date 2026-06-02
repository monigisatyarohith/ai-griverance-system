// Force Vercel to bundle pg and pg-hstore for Sequelize
require('pg');
require('pg-hstore');

const app = require('../backend/src/server');

// Vercel serverless handler - just export the Express app
module.exports = app;
