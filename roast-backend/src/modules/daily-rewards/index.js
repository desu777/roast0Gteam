const DailyRewardsService = require('./daily-rewards.service');
const DailyRewardsController = require('./daily-rewards.controller');
const { createDailyRewardsRoutes } = require('./daily-rewards.routes');

module.exports = {
  DailyRewardsService,
  DailyRewardsController,
  createDailyRewardsRoutes
}; 