import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('🌐 API Base URL:', API_BASE_URL);

// Konfiguracja axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dla logowania zapytań
api.interceptors.request.use(
  (config) => {
    console.log(`📤 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('📤 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor dla logowania błędów
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('📥 API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Game API
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