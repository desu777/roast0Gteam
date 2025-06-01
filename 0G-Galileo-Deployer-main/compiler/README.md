# 0G Contract Compiler

Microservice do kompilacji smart kontraktów Solidity dla aplikacji 0G Contract Slot Machine.

## Funkcje

- 🔧 Kompilacja kontraktów Solidity w wersji 0.8.20
- 📦 Zwracanie bytecode i ABI
- ⚡ Optymalizacja kodu przez Solidity optimizer
- 🛡️ Walidacja kodu przed kompilacją
- 📊 Estymacja kosztów gazu
- 🚨 Obsługa błędów i ostrzeżeń kompilacji
- 📝 Szczegółowe logowanie procesu

## Instalacja i uruchomienie

### 1. Instalacja zależności
```bash
cd compiler
npm install
```

### 2. Konfiguracja środowiska
Utwórz plik `.env` na podstawie `.env.example`:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DEBUG=true
```

### 3. Uruchomienie developmentowe
```bash
npm run dev
```

### 4. Build produkcyjny
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
```http
GET /health
```

### Compilation Service Health
```http
GET /api/compile/health
```

### Compile Contract
```http
POST /api/compile/contract
Content-Type: application/json

{
  "contractId": "greeter",
  "contractName": "Greeter", 
  "solidityCode": "pragma solidity ^0.8.20; contract Greeter { ... }",
  "formData": {
    "initialGreeting": "Hello, World!"
  }
}
```

#### Response Success
```json
{
  "success": true,
  "data": {
    "success": true,
    "bytecode": "0x608060405234801561001057600080fd5b5...",
    "abi": [...],
    "contractName": "Greeter",
    "gasEstimate": 156789,
    "warnings": [],
    "compilationTime": 1250
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### Response Error
```json
{
  "success": false,
  "error": "Compilation failed",
  "message": "TypeError: Identifier not found or not unique.",
  "data": {
    "warnings": [],
    "compilationTime": 890
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Get Version Info
```http
GET /api/compile/version
```

## Struktura projektu

```
compiler/
├── src/
│   ├── routes/
│   │   └── compilation.ts      # API endpoints
│   │   └── compilation.ts      # API endpoints
│   ├── services/
│   │   └── compiler.ts         # Logika kompilacji
│   ├── types/
│   │   └── index.ts           # Definicje typów TypeScript
│   ├── utils/
│   │   └── logger.ts          # System logowania
│   └── server.ts              # Główny serwer Express
├── package.json
├── tsconfig.json
└── README.md
```

## Obsługiwane kontrakty

Kompiler obsługuje wszystkie typy kontraktów z głównej aplikacji:
- **Common**: Greeter, Counter
- **Rare**: ERC-721 NFT, Lottery  
- **Epic**: MultiSig Wallet, Staking Pool
- **Legendary**: ERC-20 Token

## Bezpieczeństwo

- 🛡️ Helmet.js dla podstawowego bezpieczeństwa
- 🌐 CORS skonfigurowany tylko dla frontend URL
- 📏 Limity rozmiaru requestów (10MB)
- ✅ Walidacja wszystkich danych wejściowych
- 🚫 Brak przechowywania wrażliwych danych

## Monitorowanie

- 📊 Szczegółowe logi z kolorowaniem
- ⏱️ Mierzenie czasu kompilacji
- 🚨 Logowanie błędów i ostrzeżeń
- 📈 Metryki wydajności

## Development

### Uruchomienie z hot reload:
```bash
npm run dev
```

### Testowanie:
```bash
npm test
```

### Build:
```bash
npm run build
```

## Integracja z główną aplikacją

Kompiler jest wywoływany z głównej aplikacji React przez:
1. Użytkownik konfiguruje kontrakt
2. Frontend wysyła POST do `/api/compile/contract`
3. Kompiler zwraca bytecode + ABI
4. Frontend używa wyniku do wdrożenia przez portfel

## Wymagania systemowe

- Node.js 18+
- TypeScript 5.6+
- Pamięć: minimum 512MB
- Procesor: dowolny (kompilacja nie jest intensywna)

---

**Port**: 3001  
**Status**: Ready for production  
**Wersja**: 1.0.0 