const { AIService } = require('./ai.service');
const { AIController } = require('./ai.controller');
const { createAIRoutes } = require('./ai.routes');

module.exports = {
  AIService,
  AIController,
  createAIRoutes
}; 