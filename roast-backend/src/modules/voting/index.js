const VotingService = require('./voting.service');
const VotingController = require('./voting.controller');
const { createVotingRoutes } = require('./voting.routes');

module.exports = {
  VotingService,
  VotingController,
  createVotingRoutes
}; 