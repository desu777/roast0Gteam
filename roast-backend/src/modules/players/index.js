const { PlayersService } = require('./players.service');
const { PlayersController } = require('./players.controller');
const { createPlayersRoutes } = require('./players.routes');
const { HallOfFameService } = require('./halloffame.service');

module.exports = {
  PlayersService,
  PlayersController,
  createPlayersRoutes,
  HallOfFameService
}; 