const TreasuryService = require('./treasury.service');
const TreasuryController = require('./treasury.controller');
const { createTreasuryRoutes } = require('./treasury.routes');

module.exports = {
  TreasuryService,
  TreasuryController,
  createTreasuryRoutes
}; 