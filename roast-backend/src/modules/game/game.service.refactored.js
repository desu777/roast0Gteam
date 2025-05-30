const { config } = require('../../config/app.config');
const { logger } = require('../../services/logger.service');
const { GameOrchestrator } = require('./components');

/**
 * Refactored GameService - now uses component architecture
 * 
 * This is a clean wrapper around GameOrchestrator that maintains
 * backward compatibility while providing much cleaner code structure.
 * 
 * COMPONENTS BREAKDOWN:
 * - RoundManager: Handles round lifecycle (create, start, complete)
 * - TimerManager: Manages all timers (round, locks, auto-start)  
 * - SubmissionManager: Handles player submissions and locking
 * - GameEventEmitter: Manages WebSocket events and communication
 * - GameOrchestrator: Coordinates all components
 * 
 * FIXES APPLIED:
 * ✅ Removed duplicate scheduleLocksForRound methods
 * ✅ Proper cleanup of lock timers
 * ✅ Separated concerns into focused components
 * ✅ Maintained all existing functionality
 * ✅ Added better error handling and logging
 */
class GameService {
  constructor(wsEmitter = null, aiService = null, treasuryService = null, votingService = null) {
    // Initialize the orchestrator with all services
    this.orchestrator = new GameOrchestrator(wsEmitter, aiService, treasuryService, votingService);
    
    if (config.logging.testEnv) {
      logger.info('Refactored GameService initialized', {
        wsEmitter: !!wsEmitter,
        aiService: !!aiService,
        treasuryService: !!treasuryService,
        votingService: !!votingService
      });
    }
  }

  // ================================
  // MAIN GAME METHODS
  // ================================

  async createNewRound(preferredCharacter = null) {
    return this.orchestrator.createNewRound(preferredCharacter);
  }

  async joinRound(playerAddress, roastText, paymentTxHash = null) {
    return this.orchestrator.joinRound(playerAddress, roastText, paymentTxHash);
  }

  async startRound(roundId) {
    return this.orchestrator.startRound(roundId);
  }

  async transitionToJudging(roundId) {
    return this.orchestrator.transitionToJudging(roundId);
  }

  async completeRound(roundId) {
    return this.orchestrator.completeRound(roundId);
  }

  // ================================
  // PUBLIC API METHODS
  // ================================

  getCurrentRound() {
    return this.orchestrator.getCurrentRound();
  }

  getRoundSubmissions(roundId, includeFullText = false) {
    return this.orchestrator.getRoundSubmissions(roundId, includeFullText);
  }

  getGameStats() {
    return this.orchestrator.getGameStats();
  }

  canPlayerJoin(roundId, playerAddress) {
    return this.orchestrator.canPlayerJoin(roundId, playerAddress);
  }

  // ================================
  // VOTING INTEGRATION
  // ================================

  setNextJudgeVotingResult(characterId) {
    return this.orchestrator.setNextJudgeVotingResult(characterId);
  }

  getNextJudgeVotingResult() {
    return this.orchestrator.getNextJudgeVotingResult();
  }

  // ================================
  // TIMER MANAGEMENT (delegated)
  // ================================

  startTimer(roundId, durationSeconds, onComplete) {
    return this.orchestrator.timerManager.startTimer(roundId, durationSeconds, onComplete);
  }

  clearTimer(roundId) {
    return this.orchestrator.timerManager.clearTimer(roundId);
  }

  scheduleNextRound() {
    return this.orchestrator.scheduleNextRound();
  }

  getTimeLeft(roundId) {
    return this.orchestrator.timerManager.getTimeLeft(roundId);
  }

  // ================================
  // WEBSOCKET METHODS (delegated)
  // ================================

  emitToRoom(roundId, event, data) {
    return this.orchestrator.emitToRoom(roundId, event, data);
  }

  emitToAll(event, data) {
    return this.orchestrator.emitToAll(event, data);
  }

  emitRoundUpdate(round, playerCount, timeLeft = null) {
    return this.orchestrator.emitRoundUpdate(round, playerCount, timeLeft);
  }

  setWSService(wsService) {
    return this.orchestrator.setWSService(wsService);
  }

  // ================================
  // RECOVERY & CLEANUP
  // ================================

  resumeActiveRounds() {
    return this.orchestrator.resumeActiveRounds();
  }

  cleanup() {
    return this.orchestrator.cleanup();
  }

  // ================================
  // MONITORING & STATUS
  // ================================

  getSystemStatus() {
    return this.orchestrator.getSystemStatus();
  }

  // ================================
  // COMPONENT ACCESS (for advanced usage)
  // ================================

  get roundManager() {
    return this.orchestrator.roundManager;
  }

  get timerManager() {
    return this.orchestrator.timerManager;
  }

  get submissionManager() {
    return this.orchestrator.submissionManager;
  }

  get eventEmitter() {
    return this.orchestrator.eventEmitter;
  }

  // ================================
  // BACKWARD COMPATIBILITY METHODS
  // ================================

  // These methods maintain compatibility with existing code
  // that may call the old game service methods

  async checkAndStartWaitingRounds() {
    return this.orchestrator.roundManager.checkAndStartWaitingRounds();
  }

  isSubmissionLocked(roundId) {
    return this.orchestrator.submissionManager.isSubmissionLocked(roundId);
  }

  lockSubmissions(roundId) {
    return this.orchestrator.submissionManager.lockSubmissions(roundId);
  }

  unlockSubmissions(roundId) {
    return this.orchestrator.submissionManager.unlockSubmissions(roundId);
  }

  getSubmissionCount(roundId) {
    return this.orchestrator.submissionManager.getSubmissionCount(roundId);
  }

  hasPlayerSubmitted(roundId, playerAddress) {
    return this.orchestrator.submissionManager.hasPlayerSubmitted(roundId, playerAddress);
  }

  // ================================
  // UTILITY METHODS
  // ================================

  /**
   * Get detailed breakdown of all game components status
   * Useful for debugging and monitoring
   */
  getDetailedStatus() {
    return {
      orchestrator: 'active',
      components: {
        roundManager: !!this.roundManager,
        timerManager: !!this.timerManager,
        submissionManager: !!this.submissionManager,
        eventEmitter: !!this.eventEmitter
      },
      status: this.getSystemStatus(),
      config: {
        roundTimerDuration: config.game.roundTimerDuration,
        judgingDuration: config.game.judgingDuration,
        nextRoundDelay: config.game.nextRoundDelay,
        maxPlayersPerRound: config.game.maxPlayersPerRound
      }
    };
  }

  /**
   * Validate that all components are properly initialized
   */
  validateComponents() {
    const issues = [];

    if (!this.orchestrator) {
      issues.push('GameOrchestrator not initialized');
    }

    if (!this.roundManager) {
      issues.push('RoundManager not accessible');
    }

    if (!this.timerManager) {
      issues.push('TimerManager not accessible');
    }

    if (!this.submissionManager) {
      issues.push('SubmissionManager not accessible');
    }

    if (!this.eventEmitter) {
      issues.push('GameEventEmitter not accessible');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }
}

module.exports = GameService; 