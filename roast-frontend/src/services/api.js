import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Konfiguracja axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor dla logowania błędów
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
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
};

// Treasury API
export const treasuryApi = {
  // Przetwórz płatność za udział
  processPayment: (data) => api.post('/treasury/payment', data),
  
  // Pobierz saldo 0G
  getBalance: (address) => api.get(`/treasury/balance/${address}`),
  
  // Wypłać nagrodę
  withdraw: (data) => api.post('/treasury/withdraw', data),
};

// AI API
export const aiApi = {
  // Pobierz charaktery sędziów
  getCharacters: () => api.get('/ai/characters'),
  
  // Oceń roasty (admin)
  evaluate: (data) => api.post('/ai/evaluate', data),
};

export default api; 