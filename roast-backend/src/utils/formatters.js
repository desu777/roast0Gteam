const { TIME } = require('./constants');

// Format Ethereum address (shorten for display)
const formatAddress = (address, length = 6) => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, length)}...${address.slice(-4)}`;
};

// Format 0G amount with proper decimals
const formatCryptoAmount = (amount, decimals = 8) => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  // Format with fixed decimals and remove trailing zeros
  return num.toFixed(decimals).replace(/\.?0+$/, '');
};

// Format timestamp to ISO string
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
};

// Format duration in human readable format
const formatDuration = (milliseconds) => {
  if (milliseconds < TIME.SECOND) {
    return `${milliseconds}ms`;
  } else if (milliseconds < TIME.MINUTE) {
    return `${(milliseconds / TIME.SECOND).toFixed(1)}s`;
  } else if (milliseconds < TIME.HOUR) {
    const minutes = Math.floor(milliseconds / TIME.MINUTE);
    const seconds = Math.floor((milliseconds % TIME.MINUTE) / TIME.SECOND);
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(milliseconds / TIME.HOUR);
    const minutes = Math.floor((milliseconds % TIME.HOUR) / TIME.MINUTE);
    return `${hours}h ${minutes}m`;
  }
};

// Format timer display (MM:SS)
const formatTimer = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Format percentage
const formatPercentage = (value, decimals = 2) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '0%';
  return `${num.toFixed(decimals)}%`;
};

// Format win rate
const formatWinRate = (wins, totalGames) => {
  if (!totalGames || totalGames === 0) return '0%';
  const rate = (wins / totalGames) * 100;
  return formatPercentage(rate, 1);
};

// Format large numbers with abbreviations
const formatNumber = (num) => {
  if (num < 1000) return num.toString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  return `${(num / 1000000000).toFixed(1)}B`;
};

// Format roast preview (truncate with ellipsis)
const formatRoastPreview = (text, maxLength = 60) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

// Format error message for client
const formatErrorMessage = (error, isDevelopment = false) => {
  if (isDevelopment) {
    return {
      message: error.message,
      stack: error.stack,
      code: error.code
    };
  }
  
  // Production: hide internal details
  return {
    message: error.userMessage || 'An error occurred',
    code: error.code || 'INTERNAL_ERROR'
  };
};

// Format database row to API response
const formatRoundResponse = (round) => {
  return {
    id: round.id,
    judgeCharacter: round.judge_character,
    phase: round.phase,
    prizePool: formatCryptoAmount(round.prize_pool),
    maxPlayers: round.max_players,
    timerDuration: round.timer_duration,
    startedAt: formatTimestamp(round.started_at),
    completedAt: formatTimestamp(round.completed_at),
    createdAt: formatTimestamp(round.created_at),
    updatedAt: formatTimestamp(round.updated_at)
  };
};

// Format submission response
const formatSubmissionResponse = (submission, hideFullText = false) => {
  return {
    id: submission.id,
    roundId: submission.round_id,
    playerAddress: submission.player_address,
    roastText: hideFullText ? formatRoastPreview(submission.roast_text) : submission.roast_text,
    entryFee: formatCryptoAmount(submission.entry_fee),
    submittedAt: formatTimestamp(submission.submitted_at)
  };
};

// Format player stats response
const formatPlayerStatsResponse = (stats) => {
  return {
    playerAddress: stats.player_address,
    totalGames: stats.total_games,
    totalWins: stats.total_wins,
    winRate: formatWinRate(stats.total_wins, stats.total_games),
    totalSpent: formatCryptoAmount(stats.total_spent),
    totalEarned: formatCryptoAmount(stats.total_earned),
    profit: formatCryptoAmount(stats.total_earned - stats.total_spent),
    lastActive: formatTimestamp(stats.last_active),
    createdAt: formatTimestamp(stats.created_at)
  };
};

// Format leaderboard entry
const formatLeaderboardEntry = (entry, position) => {
  return {
    position,
    playerAddress: entry.player_address,
    displayAddress: formatAddress(entry.player_address),
    totalWins: entry.total_wins,
    totalGames: entry.total_games,
    winRate: formatWinRate(entry.total_wins, entry.total_games),
    totalEarned: formatCryptoAmount(entry.total_earned)
  };
};

// Format WebSocket event data
const formatWSRoundUpdate = (round, playerCount, timeLeft = null) => {
  return {
    roundId: round.id,
    phase: round.phase,
    timeLeft,
    playerCount,
    prizePool: formatCryptoAmount(round.prize_pool)
  };
};

// Format transaction for logging
const formatTransaction = (tx) => {
  return {
    hash: tx.hash,
    from: formatAddress(tx.from),
    to: formatAddress(tx.to),
    value: formatCryptoAmount(tx.value),
    gasUsed: tx.gasUsed ? formatNumber(tx.gasUsed) : null,
    status: tx.status
  };
};

module.exports = {
  formatAddress,
  formatCryptoAmount,
  formatTimestamp,
  formatDuration,
  formatTimer,
  formatPercentage,
  formatWinRate,
  formatNumber,
  formatRoastPreview,
  formatErrorMessage,
  formatRoundResponse,
  formatSubmissionResponse,
  formatPlayerStatsResponse,
  formatLeaderboardEntry,
  formatWSRoundUpdate,
  formatTransaction
}; 