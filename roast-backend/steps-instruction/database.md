# 🗄️ Baza Danych - 0G Roast Arena Backend

## ✅ Co zostało zaimplementowane

### 📊 Struktura Bazy Danych (SQLite)

Używamy **SQLite** z biblioteką `better-sqlite3` - szybka, lokalna baza danych, idealna na początek.

#### Tabele w bazie danych:

**1. `rounds` - Rundy gry**
- `id` - unikalny numer rundy
- `judge_character` - który sędzia (michael, ada, jc, elisha, ren, yon)
- `phase` - faza gry (waiting, active, judging, completed)
- `prize_pool` - pula nagród w 0G
- `max_players` - maksymalna liczba graczy
- `timer_duration` - czas na rundę w sekundach
- `started_at`, `completed_at` - znaczniki czasu

**2. `submissions` - Roasty graczy**
- `id` - unikalny numer roasta
- `round_id` - do której rundy należy
- `player_address` - adres portfela gracza
- `roast_text` - tekst roasta
- `entry_fee` - opłata wejściowa (0.025 0G)
- Jeden gracz = jeden roast na rundę (UNIQUE constraint)

**3. `results` - Wyniki rund**
- `id` - unikalny numer wyniku
- `round_id` - która runda
- `winner_submission_id` - wygrywający roast
- `ai_reasoning` - uzasadnienie AI dlaczego wygrał
- `prize_amount` - kwota nagrody
- `transaction_hash` - hash transakcji 0G

**4. `player_stats` - Statystyki graczy**
- `player_address` - adres portfela (PRIMARY KEY)
- `total_games`, `total_wins` - ile gier, ile wygranych
- `total_spent`, `total_earned` - ile wydał, ile zarobił
- `last_active` - ostatnia aktywność

**5. `config` - Konfiguracja systemu**
- `key`, `value` - klucz i wartość konfiguracji
- Do przechowywania ustawień bez restartowania serwera

### 🔧 Zaimplementowane Serwisy

#### 1. **Database Service** (`src/database/database.service.js`)
**Za co odpowiada:** Główny serwis obsługujący bazę danych
- Połączenie z SQLite
- Przygotowane zapytania (prepared statements) dla szybkości
- Transakcje - operacje atomowe (wszystko albo nic)
- Automatyczne logowanie wolnych zapytań
- Backup bazy danych

**Kluczowe funkcje:**
- `getCurrentRound()` - pobiera aktywną rundę
- `createSubmission()` - dodaje roast gracza
- `createResult()` - zapisuje wynik rundy
- `getLeaderboard()` - ranking graczy

#### 2. **Migration System** (`src/database/migrate.js`)
**Za co odpowiada:** Aktualizacje struktury bazy danych
- Tworzy tabele przy pierwszym uruchomieniu
- Umożliwia bezpieczne zmiany w strukturze
- Rollback - powrót do poprzedniej wersji
- Śledzenie zastosowanych migracji

**Jak używać:**
```bash
npm run migrate          # Uruchom migracje
node src/database/migrate.js rollback 1  # Cofnij do wersji 1
```

#### 3. **Seeding System** (`src/database/seed.js`)
**Za co odpowiada:** Dodawanie danych testowych
- Tworzy przykładowe rundy i roasty
- Różne roasty dla każdego charakteru sędziego
- Statystyki graczy do testowania
- **Tylko w trybie development!**

**Jak używać:**
```bash
npm run seed             # Dodaj dane testowe
node src/database/create.js --seed  # Utwórz bazę + dane
```

---

## 🛠️ Narzędzia Developerskie - Proste Wyjaśnienia

### **ESLint** (`.eslintrc.js`)
**Co to jest:** Narzędzie sprawdzające jakość kodu JavaScript
**Za co odpowiada:**
- Znajduje błędy w kodzie zanim uruchomisz aplikację
- Egzekwuje jednolity styl pisania (spacje, średniki, etc.)
- Ostrzega przed potencjalnymi problemami

**Przykład:** Jeśli napiszesz `let x = 5` ale nigdy nie użyjesz `x`, ESLint powie "unused variable"

### **Nodemon** (`nodemon.json`)
**Co to jest:** Automatyczne restartowanie serwera podczas development
**Za co odpowiada:**
- Obserwuje zmiany w plikach `.js` i `.json`
- Automatycznie restartuje serwer po każdej zmianie
- Nie musisz ręcznie zatrzymywać i uruchamiać serwera

**Przykład:** Zmienisz coś w kodzie → zapisujesz → serwer sam się restartuje

### **CORS** (Cross-Origin Resource Sharing)
**Co to jest:** Bezpieczeństwo przeglądarek internetowych
**Za co odpowiada:**
- Określa które domeny mogą łączyć się z naszym API
- Frontend (localhost:3000) może rozmawiać z backendem (localhost:3001)
- Bez tego przeglądarka zablokuje połączenia

**Przykład:** Bez CORS React app nie mógłby pobierać danych z naszego API

### **Helmet**
**Co to jest:** Zabezpieczenia HTTP headers
**Za co odpowiada:**
- Dodaje dodatkowe nagłówki bezpieczeństwa
- Chroni przed atakami XSS (wstrzykiwanie scriptu)
- Ukrywa informacje o serwerze przed hakerami

**Przykład:** Ustawia `X-Frame-Options` żeby strona nie mogła być wstawiona w iframe

### **Compression**
**Co to jest:** Kompresja odpowiedzi HTTP
**Za co odpowiada:**
- Zmniejsza rozmiar danych wysyłanych do przeglądarki
- Szybsze ładowanie strony (mniej danych do pobrania)
- Oszczędność przepustowości

**Przykład:** JSON 100KB → po kompresji 20KB

### **Rate Limiting**
**Co to jest:** Ograniczanie liczby requestów
**Za co odpowiada:**
- Maksymalnie 10 requestów na minutę z jednego IP
- Chroni przed spamem i atakami DDoS
- Sprawiedliwy dostęp do API dla wszystkich

**Przykład:** Jeśli ktoś wysyła 100 requestów na sekundę → dostaje błąd 429

---

## 🔧 Utility Functions - Funkcje Pomocnicze

### **Constants** (`src/utils/constants.js`)
**Za co odpowiada:** Stałe wartości używane w całej aplikacji
- `GAME_PHASES` - fazy gry (waiting, active, judging, completed)
- `WS_EVENTS` - nazwy eventów WebSocket
- `ERROR_CODES` - kody błędów
- `CHARACTERS` - dane postaci sędziów z wagami oceniania
- `LIMITS` - limity (min/max długość roasta, liczba graczy)

**Przykład:**
```js
const GAME_PHASES = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  JUDGING: 'judging',
  COMPLETED: 'completed'
};
```

### **Formatters** (`src/utils/formatters.js`)
**Za co odpowiada:** Funkcje formatujące dane do wyświetlania
- `formatAddress()` - skraca adres portfela (0x742d...4197)
- `formatCryptoAmount()` - formatuje kwoty 0G (0.025000 → 0.025)
- `formatDuration()` - czas w czytelnej formie (120000ms → 2m 0s)
- `formatTimer()` - timer gry (120 → 2:00)
- `formatWinRate()` - procent wygranych (5/10 → 50%)

**Przykład:**
```js
formatAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f8fA12')
// Zwraca: '0x742d...fA12'
```

### **Validators** (`src/utils/validators.js`)
**Za co odpowiada:** Dodatkowe funkcje sprawdzające poprawność danych
- `canJoinRound()` - czy gracz może dołączyć do rundy
- `canStartRound()` - czy runda może się rozpocząć
- `validateRoastContent()` - sprawdza jakość roasta (nie za krótki, nie spam)
- `isAdminAddress()` - czy adres to administrator
- `isValidEntryFee()` - czy opłata wejściowa jest prawidłowa

**Przykład:**
```js
canJoinRound(round, currentPlayerCount)
// Zwraca: { valid: true } lub { valid: false, reason: 'Round is full' }
```

---

## 📋 NPM Scripts - Komendy

```bash
npm run dev          # Uruchom development server z nodemon
npm run migrate      # Uruchom migracje bazy danych
npm run seed         # Dodaj dane testowe
npm start            # Uruchom production server
npm run lint         # Sprawdź kod ESLintem
```

---

## 🚀 Następne Kroki

**Gotowe moduły do implementacji:**

1. **Game Module** - logika rund i rozgrywki
2. **WebSocket Module** - komunikacja real-time
3. **Treasury Module** - płatności 0G
4. **AI Module** - ocenianie roastów
5. **API Controllers** - endpointy REST

**Struktura plików (każdy max 400 linii):**
```
src/modules/
├── game/
│   ├── game.service.js      # Logika gry
│   ├── game.controller.js   # API endpoints
│   └── game.routes.js       # Routing
├── treasury/
│   ├── treasury.service.js  # Płatności 0G
│   └── treasury.controller.js
├── ai/
│   ├── ai.service.js        # Ocenianie roastów
│   └── ai.controller.js
└── websocket/
    ├── websocket.service.js # Socket.IO logic
    └── websocket.events.js  # Event handlers
```

Wszystko jest przygotowane do dalszej implementacji! 🎉
