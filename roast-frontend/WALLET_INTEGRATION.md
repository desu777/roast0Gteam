# 🔗 Wallet Integration Guide

## 📋 Przegląd Integracji

Aplikacja została zintegrowana z prawdziwymi walletami używając **RainbowKit** i **Wagmi** z custom chainem **0G-Galileo-Testnet**.

## 🔧 Konfiguracja

### 1. Zmienne Środowiskowe

Skopiuj `env.example` do `.env` i skonfiguruj:

```bash
# API Configuration
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_WS_URL=http://localhost:3001

# Wallet Configuration  
REACT_APP_WALLET_CONNECT_PROJECT_ID=your-wallet-connect-project-id

# 0G Network Treasury Address
REACT_APP_TREASURY_ADDRESS=0x1234567890123456789012345678901234567890
```

### 2. Custom Chain Configuration

Chain jest automatycznie konfigurowany w `src/config/wagmi.js`:

```javascript
export const zgGalileoTestnet = defineChain({
  id: 16601,
  name: '0G-Galileo-Testnet',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: '0G',
  },
  rpcUrls: {
    default: {
      http: ['https://evmrpc-testnet.0g.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: '0G Explorer',
      url: 'https://chainscan-galileo.0g.ai',
    },
  },
  testnet: true,
});
```

## 🔐 Proces Autoryzacji

### 1. Połączenie Walleta
- Użytkownik klika "Connect Wallet"
- RainbowKit otwiera modal z dostępnymi walletami
- Po połączeniu sprawdzana jest sieć (musi być 0G-Galileo-Testnet)

### 2. Uwierzytelnienie
- Automatyczne tworzenie wiadomości do podpisania:
  ```
  0G Roast Arena authentication
  Address: {address}
  Timestamp: {timestamp}
  ```
- Podpisanie wiadomości przez wallet
- Weryfikacja podpisu przez backend
- Timestamp ważny maksymalnie 5 minut

### 3. Autoryzacja Backendu
Backend weryfikuje:
- ✅ Format wiadomości
- ✅ Poprawność podpisu
- ✅ Aktualność timestamp (max 5 min)
- ✅ Zgodność adresu z podpisem

## 🎮 Flow Gry

### 1. Dołączenie do Rundy
```javascript
// 1. Wyślij płatność 0.025 0G do treasury
const txHash = await sendTransactionAsync({
  to: treasuryAddress,
  value: parseEther('0.025'),
});

// 2. Wyślij roast przez WebSocket
wsService.submitRoast(roundId, roastText, txHash);
```

### 2. Weryfikacja Płatności (Backend)
- Sprawdzenie transakcji na 0G Network
- Weryfikacja kwoty (0.025 0G)
- Weryfikacja odbiorcy (treasury address)
- Weryfikacja nadawcy (player address)
- Sprawdzenie aktualności (max 5 min)

## 🔄 WebSocket Events

### Client → Server
- `authenticate` - uwierzytelnienie użytkownika
- `join-round` - dołączenie do rundy
- `submit-roast` - wysłanie roasta z hash transakcji
- `leave-round` - opuszczenie rundy

### Server → Client
- `authenticated` - potwierdzenie uwierzytelnienia
- `round-created` - nowa runda utworzona
- `round-updated` - aktualizacja rundy
- `timer-update` - aktualizacja timera
- `player-joined` - gracz dołączył
- `judging-started` - rozpoczęcie oceniania
- `round-completed` - zakończenie rundy z wynikami
- `roast-submitted` - potwierdzenie wysłania roasta

## 🛠️ Komponenty

### useWallet Hook
```javascript
const {
  address,           // Adres walleta
  isConnected,       // Status połączenia
  isCorrectChain,    // Czy na właściwym chainie
  isAuthenticated,   // Czy uwierzytelniony
  balance,           // Saldo 0G
  connectWallet,     // Funkcja połączenia
  disconnectWallet,  // Funkcja rozłączenia
  authenticate,      // Funkcja uwierzytelnienia
} = useWallet();
```

### useGameState Hook
```javascript
const {
  currentRound,      // Aktualna runda z backendu
  currentPhase,      // Faza gry
  participants,      // Lista uczestników
  isConnected,       // Status połączenia (wallet + WebSocket)
  joinRound,         // Funkcja dołączenia do rundy
  error,             // Błędy
} = useGameState();
```

## 🔍 Debugging

### 1. Sprawdź Połączenie
```javascript
// Status walleta
console.log('Wallet:', useWallet());

// Status WebSocket
console.log('WS:', wsService.getConnectionStatus());
```

### 2. Sprawdź Sieć
- Wallet musi być połączony z 0G-Galileo-Testnet (Chain ID: 16601)
- RPC: https://evmrpc-testnet.0g.ai
- Explorer: https://chainscan-galileo.0g.ai

### 3. Sprawdź Backend
- API dostępne na `http://localhost:3001/api`
- WebSocket na `http://localhost:3001`
- Health check: `GET /health`

## 🚨 Błędy i Rozwiązania

### "Switch to 0G-Galileo-Testnet"
- Wallet nie jest na właściwym chainie
- Dodaj sieć ręcznie lub użyj przełącznika w aplikacji

### "Authentication failed"
- Sprawdź czy timestamp nie jest za stary (max 5 min)
- Sprawdź format wiadomości
- Sprawdź czy backend jest uruchomiony

### "Transaction failed"
- Sprawdź saldo 0G (minimum 0.025 + gas)
- Sprawdź adres treasury
- Sprawdź czy transakcja została potwierdzona

### "WebSocket disconnected"
- Sprawdź czy backend WebSocket działa
- Sprawdź URL WebSocket w .env
- Sprawdź czy użytkownik jest uwierzytelniony

## 📚 Dodatkowe Zasoby

- [RainbowKit Docs](https://rainbowkit.com)
- [Wagmi Docs](https://wagmi.sh)
- [0G Network Docs](https://docs.0g.ai)
- [Viem Docs](https://viem.sh) 