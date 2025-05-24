const { PlayersService } = require('./players.service');
const { PlayersController } = require('./players.controller');
const { createPlayersRoutes } = require('./players.routes');

module.exports = {
  PlayersService,
  PlayersController,
  createPlayersRoutes
}; 