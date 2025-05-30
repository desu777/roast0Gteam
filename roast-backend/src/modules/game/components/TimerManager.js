const { config } = require('../../../config/app.config');
const { logger } = require('../../../services/logger.service');
const { 
  WS_EVENTS, 
  GAME_PHASES,
  MESSAGES 
} = require('../../../utils/constants');

class TimerManager {
  constructor(eventEmitter = null) {
    this.eventEmitter = eventEmitter;
    this.activeTimers = new Map(); // roundId -> { timer, startTime, duration, timeLeft }
    this.lockTimers = new Map(); // roundId -> timer
    this.autoStartTimer = null;
    
    if (config.logging.testEnv) {
      logger.info('TimerManager initialized');
    }
  }

  // ================================
  // ROUND TIMERS
  // ================================

  startTimer(roundId, durationSeconds, onComplete) {
    // Clear any existing timer for this round
    this.clearTimer(roundId);

    let timeLeft = durationSeconds;
    
    const timer = setInterval(() => {
      timeLeft--;

      // ✨ KLUCZOWE: Wysyłaj update CO SEKUNDĘ dla perfect sync!
      // Usuń rate limiting - live streaming wymaga real-time updates
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, WS_EVENTS.TIMER_UPDATE, {
          roundId,
          timeLeft,
          serverTimestamp: Date.now(), // Dodaj server timestamp dla sync
          phase: timeLeft > 0 ? 'active' : 'completing'
        });
        
        if (config.logging.testEnv) {
          console.log(`⏱️ Live timer update: ${timeLeft}s`);
        }
      }

      // Warning at 30 seconds
      if (timeLeft === 30) {
        if (this.eventEmitter) {
          this.eventEmitter.emitToRoom(roundId, WS_EVENTS.ROUND_UPDATED, {
            roundId,
            message: MESSAGES.TIMER_WARNING
          });
        }
      }

      // Time's up
      if (timeLeft <= 0) {
        this.clearTimer(roundId);
        if (onComplete) {
          onComplete(roundId);
        }
      }

    }, 1000);

    // Store timer info with server start timestamp
    this.activeTimers.set(roundId, {
      timer,
      startTime: Date.now(),
      serverStartTime: Date.now(), // For precise sync calculations
      duration: durationSeconds,
      timeLeft
    });

    if (config.logging.testEnv) {
      logger.debug('Live timer started with 1s updates', { roundId, duration: durationSeconds });
    }

    return timer;
  }

  clearTimer(roundId) {
    const timerInfo = this.activeTimers.get(roundId);
    if (timerInfo) {
      clearInterval(timerInfo.timer);
      this.activeTimers.delete(roundId);
      
      if (config.logging.testEnv) {
        logger.debug('Timer cleared', { roundId });
      }
    }
  }

  getTimeLeft(roundId) {
    const timerInfo = this.activeTimers.get(roundId);
    if (!timerInfo) {
      if (config.logging.testEnv) {
        logger.debug('No active timer found for round', { roundId });
      }
      return null;
    }

    const elapsed = Math.floor((Date.now() - timerInfo.startTime) / 1000);
    const calculatedTimeLeft = Math.max(0, timerInfo.duration - elapsed);
    
    if (config.logging.testEnv) {
      logger.debug('Timer calculation', { 
        roundId, 
        duration: timerInfo.duration,
        elapsed, 
        calculatedTimeLeft,
        serverStartTime: timerInfo.serverStartTime
      });
    }
    
    return calculatedTimeLeft;
  }

  isTimerActive(roundId) {
    return this.activeTimers.has(roundId);
  }

  // ================================
  // SUBMISSION LOCK TIMERS
  // ================================

  scheduleLockTimer(roundId, timeUntilLock, onLock) {
    // Clear existing lock timer
    if (this.lockTimers.has(roundId)) {
      clearTimeout(this.lockTimers.get(roundId));
    }

    // Schedule lock for specified time (usually 10 seconds before round ends)
    const timer = setTimeout(() => {
      if (config.logging.testEnv) {
        logger.info('Submissions locked for round', { roundId });
      }

      // Emit submission locked event
      if (this.eventEmitter) {
        this.eventEmitter.emitToRoom(roundId, 'submission-locked', { roundId });
      }

      if (onLock) {
        onLock(roundId);
      }

      // Clean up timer
      this.lockTimers.delete(roundId);
    }, timeUntilLock * 1000);

    this.lockTimers.set(roundId, timer);
    
    if (config.logging.testEnv) {
      logger.info('Lock timer scheduled for round', { roundId, timeUntilLock });
    }
  }

  clearLockTimer(roundId) {
    const timer = this.lockTimers.get(roundId);
    if (timer) {
      clearTimeout(timer);
      this.lockTimers.delete(roundId);
      
      if (config.logging.testEnv) {
        logger.debug('Lock timer cleared', { roundId });
      }
    }
  }

  // ================================
  // AUTO-START TIMER
  // ================================

  scheduleNextRound(onCreateRound, delay = config.game.nextRoundDelay) {
    // Clear any existing auto-start timer
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
    }

    // Schedule new round creation
    this.autoStartTimer = setTimeout(() => {
      if (config.logging.testEnv) {
        logger.info('Auto-creating next round', { delay });
      }

      if (onCreateRound) {
        onCreateRound();
      }

      this.autoStartTimer = null;
    }, delay * 1000);

    if (config.logging.testEnv) {
      logger.info('Next round scheduled', { delay });
    }
  }

  clearAutoStartTimer() {
    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
      
      if (config.logging.testEnv) {
        logger.debug('Auto-start timer cleared');
      }
    }
  }

  // ================================
  // RESUME TIMERS (for server restart)
  // ================================

  resumeTimer(roundId, remainingSeconds, onComplete) {
    if (remainingSeconds > 0) {
      return this.startTimer(roundId, remainingSeconds, onComplete);
    } else {
      // Time already expired, trigger completion immediately
      if (onComplete) {
        onComplete(roundId);
      }
      return null;
    }
  }

  // ================================
  // CLEANUP
  // ================================

  cleanup() {
    // Clear all active timers
    this.activeTimers.forEach((timerInfo, roundId) => {
      this.clearTimer(roundId);
    });

    // Clear all lock timers
    this.lockTimers.forEach((timer, roundId) => {
      this.clearLockTimer(roundId);
    });

    // Clear auto-start timer
    this.clearAutoStartTimer();

    if (config.logging.testEnv) {
      logger.info('TimerManager cleanup completed');
    }
  }

  // ================================
  // STATUS METHODS
  // ================================

  getActiveTimersStatus() {
    const status = {};
    
    this.activeTimers.forEach((timerInfo, roundId) => {
      const elapsed = Math.floor((Date.now() - timerInfo.startTime) / 1000);
      const timeLeft = Math.max(0, timerInfo.duration - elapsed);
      
      status[roundId] = {
        duration: timerInfo.duration,
        elapsed,
        timeLeft,
        startTime: timerInfo.startTime
      };
    });

    return status;
  }

  getLockTimersStatus() {
    const status = {};
    
    this.lockTimers.forEach((timer, roundId) => {
      status[roundId] = {
        scheduled: true,
        timer: !!timer
      };
    });

    return status;
  }

  getAutoStartStatus() {
    return {
      scheduled: !!this.autoStartTimer,
      timer: this.autoStartTimer
    };
  }

  getAllTimersStatus() {
    return {
      activeTimers: this.getActiveTimersStatus(),
      lockTimers: this.getLockTimersStatus(),
      autoStart: this.getAutoStartStatus(),
      totalActiveTimers: this.activeTimers.size,
      totalLockTimers: this.lockTimers.size
    };
  }
}

module.exports = TimerManager; 