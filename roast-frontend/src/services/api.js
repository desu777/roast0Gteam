import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const BATTLE_API_URL = import.meta.env.VITE_BATTLE_API_URL || 'http://localhost:3002/api';

if (import.meta.env.VITE_TEST_ENV === 'true') {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('🎯 Battle API URL:', BATTLE_API_URL);
}

// Konfiguracja axios dla głównej gry
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Konfiguracja axios dla battle system
const battleAxios = axios.create({
  baseURL: BATTLE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dla logowania zapytań (główna gra)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('📤 API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor dla logowania zapytań (battle system)
battleAxios.interceptors.request.use(
  (config) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`📤 Battle API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('📤 Battle API Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Interceptor dla logowania błędów (główna gra)
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`📥 API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('📥 API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Interceptor dla logowania błędów (battle system)
battleAxios.interceptors.response.use(
  (response) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.log(`📥 Battle API Response: ${response.status} ${response.config.url}`, response.data);
    }
    return response;
  },
  (error) => {
    if (import.meta.env.VITE_TEST_ENV === 'true') {
      console.error('📥 Battle API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

// Game API (główna arena)
export const gameApi = {
  // Pobierz aktualną rundę
  getCurrentRound: () => api.get('/game/current'),
  
  // Pobierz historię rund
  getRounds: (limit = 10, offset = 0) => 
    api.get(`/game/rounds?limit=${limit}&offset=${offset}`),
  
  // Pobierz szczegóły rundy
  getRound: (roundId) => api.get(`/game/rounds/${roundId}`),
  
  // Pobierz statystyki gry
  getStats: () => api.get('/game/stats'),
  
  // Wyślij wynik głosowania na następnego sędziego
  submitVotingResult: (characterId, totalVotes) => 
    api.post('/game/vote-next-judge', { characterId, totalVotes }),
};

// Battle API (1v1 battles)
export const battleApi = {
  // Pobierz aktualną bitwę
  getCurrentBattle: () => battleAxios.get('/battle/current'),
  
  // Postaw zakład
  placeBet: (data) => battleAxios.post('/battle/bet', data),
  
  // Pobierz historię bitew
  getBattleHistory: (limit = 20, offset = 0) => 
    battleAxios.get(`/battle/history?limit=${limit}&offset=${offset}`),
  
  // Pobierz szczegóły bitwy
  getBattle: (battleId) => battleAxios.get(`/battle/history/${battleId}`),
  
  // Pobierz statystyki gracza
  getPlayerStats: (address) => battleAxios.get(`/battle/stats/${address}`),
  
  // Pobierz ranking
  getLeaderboard: (limit = 10) => battleAxios.get(`/battle/leaderboard?limit=${limit}`),
  
  // Pobierz konfigurację battle system
  getConfig: () => battleAxios.get('/battle/config'),
  
  // Health check
  getHealth: () => battleAxios.get('/health'),
};

// Players API
export const playersApi = {
  // Pobierz profil gracza
  getProfile: (address) => api.get(`/players/profile/${address}`),
  
  // Weryfikuj podpis walleta
  verifySignature: (data) => api.post('/players/verify', data),
  
  // Pobierz ranking
  getLeaderboard: (limit = 10, sortBy = 'earnings') => 
    api.get(`/players/leaderboard?limit=${limit}&sortBy=${sortBy}`),
  
  // Pobierz Hall of Fame z wieloma kategoriami leaderboardów
  getHallOfFame: (limit = 10) => 
    api.get(`/players/hall-of-fame?limit=${limit}`),
  
  // Pobierz kompletne statystyki All Time Roasted
  getAllTimeRoasted: () => 
    api.get('/players/all-time-roasted'),
  
  // Pobierz statystyki serwisu
  getStats: () => 
    api.get('/players/stats'),
  
  // Daily Rewards API
  getDailyRewards: (date = null) => {
    const url = date ? `/players/daily-rewards?date=${date}` : '/players/daily-rewards';
    return api.get(url);
  },
  
  // Pobierz historię daily rewards
  getDailyRewardsHistory: (limit = 14) => 
    api.get(`/players/daily-rewards/history?limit=${limit}`),
};

// Treasury API
export const treasuryApi = {
  // Przetwórz płatność za udział
  processPayment: (data) => api.post('/treasury/payment', data),
  
  // Pobierz saldo 0G
  getBalance: (address) => api.get(`/treasury/balance/${address}`),
  
  // Wypłać nagrodę
  withdraw: (data) => api.post('/treasury/withdraw', data),
  
  // Pobierz ostatnich zwycięzców
  getRecentWinners: (limit = 10) => api.get(`/treasury/recent-winners?limit=${limit}`),
};

// AI API
export const aiApi = {
  // Pobierz charaktery sędziów
  getCharacters: () => api.get('/ai/characters'),
  
  // Oceń roasty (admin)
  evaluate: (data) => api.post('/ai/evaluate', data),
};

// Voting API
export const votingApi = {
  // Cast vote for next judge
  castVote: (roundId, characterId, voterAddress) => 
    api.post('/voting/vote', { roundId, characterId, voterAddress }),
  
  // Get voting statistics for round
  getVotingStats: (roundId) => 
    api.get(`/voting/stats/${roundId}`),
  
  // Check user's vote for round
  getUserVote: (roundId, address) => 
    api.get(`/voting/user-vote/${roundId}/${address}`),
  
  // Voting service health check
  getHealth: () => 
    api.get('/voting/health'),
};

export default api; 