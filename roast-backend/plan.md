📋 PLAN IMPLEMENTACJI BACKEND - ROAST 0G
🎯 GŁÓWNE ZADANIA:
FAZA 1: Infrastruktura i Baza Danych (2-3 dni)
Utworzenie struktury projektu JavaScript
Apply to backend.md
Setup bazy danych SQLite z better-sqlite3
Implementacja wszystkich 5 tabel z dokumentacji
Migracje i seedy
Optymalizacja performance (WAL mode, pragmas)
Konfiguracja środowiska
Express.js server
Socket.IO dla WebSocket
Middleware (cors, body-parser, rate limiting)
Logging z Winston
FAZA 2: API REST i WebSocket (3-4 dni)
Game Management API
GET /api/game/current - aktualna runda
GET /api/game/rounds - historia rund
POST /api/game/rounds - nowa runda (admin)
GET /api/game/stats - statystyki
Player Management API
GET /api/players/profile/:address - profil gracza
POST /api/players/verify - weryfikacja walleta
GET /api/players/leaderboard - ranking
WebSocket System
Rooms: game:${roundId}, global, admin
Real-time events (join, submit, timer, results)
Connection handling i error recovery
FAZA 3: 0G Cryptocurrency Integration (4-5 dni)
Treasury Service
Integracja z 0G network via ethers.js
Payment verification (0.025 0G transactions)
Hot wallet management dla prize distribution
Transaction monitoring i logging
Payment Flow
Verify incoming payments
Update prize pools automatycznie
Distribute prizes (95% do zwycięzcy, 5% house fee)
Transaction hash recording
FAZA 4: AI System (3-4 dni)
Character Implementation
Import danych z characters.json
Evaluation criteria per character
Weighted scoring system (creativity, humor, etc.)
AI Service
Integration z 0G Compute Network
Character-based reasoning generation
Roast evaluation pipeline
Fallback mechanisms
FAZA 5: Game Logic Engine (2-3 dni)
Round Management
Phase transitions: waiting → active → judging → completed
Timer system (120s rounds)
Auto-start nowych rund (30s delay)
Game Flow
Player join/leave handling
Submission processing
Winner determination
Statistics update
🛠️ STACK TECHNOLOGICZNY:
Apply to backend.md
📊 SCHEMA BAZY DANYCH (SQLite):
Confirmed Tables:
rounds - zarządzanie rundami
submissions - zgłoszenia graczy
results - wyniki i zwycięzcy
player_stats - statystyki graczy
config - konfiguracja systemu
Key Features:
WAL mode dla lepszej concurrency
Indexes dla performance
Foreign keys dla spójności danych
DECIMAL(10,8) dla precyzyjnych kwot 0G
🔗 INTEGRACJA Z 0G NETWORK:
Payment Validation:
Entry fee: 0.025 0G per submission
Transaction verification on 0G blockchain
Real-time balance monitoring
Automated prize distribution
Security:
Wallet signature verification
Transaction recency checks (<5 min)
Double-spending prevention
Rate limiting (1 submission per round per wallet)
🎮 GAME MECHANICS:
Round Phases:
WAITING (0-1 players) → ACTIVE (2+ players, 120s timer)
ACTIVE → JUDGING (timer expires/max players)
JUDGING → COMPLETED (AI evaluation done)
Auto-restart cycle (30s delay)
AI Characters:
Michael (CEO - Vision), Ada (CMO - Community), JC (Growth - Revolution)
Elisha (Community Voice), Ren (CTO - Technical), Yon (Meme Master)
Character-specific evaluation criteria i reasoning
📈 NASTĘPNE KROKI:
Czy chcesz żebym zaczął implementację od konkretnej fazy?
Potrzebujesz więcej szczegółów o konkretnym komponencie?
Masz preferencje co do konkretnych bibliotek/technologii?
Szacowany czas implementacji: 14-19 dni roboczych
Który element chciałbyś żebym zaczął implementować jako pierwszy? Polecam zacząć od bazy danych i podstawowej struktury serwera.