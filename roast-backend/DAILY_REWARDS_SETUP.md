# 🏆 Daily Hall of Fame Rewards - Setup Guide

System codziennych nagród dla najlepszych graczy z 5% house fee.

## 📋 System Nagród

### 💰 Podział Fee (5% z każdej puli):
- **Treasury**: 20% fee (1% z całości) 
- **Daily Rewards**: 80% fee (4% z całości)

### 🏆 Codziennie 12 nagrodzonych graczy:

**4 Kategorie × 3 Pozycje = 12 Nagród**

| Kategoria | 1. miejsce | 2. miejsce | 3. miejsce |
|-----------|------------|------------|------------|
| **Top Earners** | 12% puli | 8% puli | 5% puli |
| **Most Wins** | 12% puli | 8% puli | 5% puli |
| **Best Win Rate** | 12% puli | 8% puli | 5% puli |
| **Most Active** | 12% puli | 8% puli | 5% puli |

### 🎯 Wymagania Kwalifikacyjne:
- **Minimum**: 3 gry w ciągu dnia
- **Best Win Rate**: Minimum 2 wygrane
- **Cooldown**: 1 nagroda na adres na dzień

---

## 🚀 Instalacja

### 1. Migracja Bazy Danych

Uruchom migrację, aby utworzyć nowe tabele:

```bash
cd roast-backend
npm run migrate
```

Nowe tabele:
- `daily_stats` - dzienne statystyki graczy
- `daily_rewards` - wypłacone nagrody
- `treasury_balance` - śledzenie balansu treasury
- `cron_jobs` - tracking zadań cron (opcjonalne)

### 2. Uprawnienia Skryptów

Nadaj uprawnienia wykonywania:

```bash
chmod +x scripts/daily-rewards.js
chmod +x scripts/test-daily-rewards.js
```

### 3. Konfiguracja Środowiska

Upewnij się, że `.env` zawiera:

```env
# Treasury Configuration (wymagane)
TREASURY_PRIVATE_KEY=your-hot-wallet-private-key
TREASURY_PUBLIC_ADDRESS=your-treasury-address

# 0G Network (wymagane)
ZERO_G_NETWORK_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_CHAIN_ID=16601

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

---

## ⏰ Konfiguracja Cron

### Systemowy Cron (Linux/Ubuntu):

```bash
# Edytuj crontab
sudo crontab -e

# Dodaj linię (codziennie o północy UTC):
0 0 * * * /usr/bin/node /absolute/path/to/roast-backend/scripts/daily-rewards.js >> /var/log/daily-rewards.log 2>&1

# Opcjonalnie: z logowaniem do syslog
0 0 * * * /usr/bin/node /absolute/path/to/roast-backend/scripts/daily-rewards.js 2>&1 | logger -t daily-rewards
```

### Przykładowe Harmonogramy:

```bash
# Codziennie o północy UTC
0 0 * * * /usr/bin/node /path/to/scripts/daily-rewards.js

# Codziennie o 1:00 UTC (z 1h opóźnieniem)
0 1 * * * /usr/bin/node /path/to/scripts/daily-rewards.js

# Co 6 godzin (dla testów)
0 */6 * * * /usr/bin/node /path/to/scripts/daily-rewards.js

# Tylko w dni robocze
0 0 * * 1-5 /usr/bin/node /path/to/scripts/daily-rewards.js
```

### Weryfikacja Cron:

```bash
# Sprawdź status cron
sudo systemctl status cron

# Sprawdź logi cron
sudo tail -f /var/log/syslog | grep daily-rewards

# Lista zadań cron
sudo crontab -l
```

---

## 🧪 Testowanie

### Test Podstawowy (bez dystrybucji):

```bash
# Test dla wczorajszej daty
node scripts/test-daily-rewards.js

# Test dla konkretnej daty
node scripts/test-daily-rewards.js 2024-01-15

# Test z force (nadpisanie istniejących)
node scripts/test-daily-rewards.js 2024-01-15 --force
```

### Test z Dystrybucją:

```bash
# Test z rzeczywistą dystrybucją nagród
node scripts/test-daily-rewards.js 2024-01-15 --distribute

# Lub przez zmienną środowiskową
AUTO_DISTRIBUTE=true node scripts/test-daily-rewards.js 2024-01-15
```

### Przykładowy Output:

```
🧪 Starting TEST Daily Hall of Fame Rewards calculation...
📅 Using custom test date: 2024-01-15
📊 Database connected successfully
🔑 Hot wallet initialized: { address: '0x123...', network: '0G-Galileo-Testnet' }
📋 Checking existing rewards...
No existing rewards found for 2024-01-15
📊 Checking daily stats...
Found 5 players with daily stats for 2024-01-15:
  1. 0x1234567... - Games: 8, Wins: 3, Earned: 0.2400 0G, Win Rate: 37.5%
  2. 0x2345678... - Games: 6, Wins: 4, Earned: 0.1900 0G, Win Rate: 66.7%
...

💎 REWARD DISTRIBUTION PREVIEW:
=====================================
🥇 Top Earners: 0x1234567... → 0.004800 0G (12%)
🥈 Top Earners: 0x2345678... → 0.003200 0G (8%)
🥉 Top Earners: 0x3456789... → 0.002000 0G (5%)
...
=====================================
💰 Total to distribute: 0.040000 0G
🎯 Recipients: 12 players

💡 Use --distribute flag to actually send rewards
📋 This was a test run - no rewards were actually distributed
```

---

## 📊 Monitoring

### Sprawdzenie Wyników:

```sql
-- Dzisiejsze nagrody
SELECT * FROM daily_rewards 
WHERE date = DATE('now', '-1 day') 
ORDER BY category, position;

-- Treasury balance
SELECT * FROM treasury_balance 
WHERE date >= DATE('now', '-7 days')
ORDER BY date DESC;

-- Top earners ostatniego tygodnia
SELECT 
  player_address,
  SUM(reward_amount) as total_rewards,
  COUNT(*) as reward_count
FROM daily_rewards 
WHERE date >= DATE('now', '-7 days')
GROUP BY player_address
ORDER BY total_rewards DESC
LIMIT 10;
```

### Logi:

```bash
# Logi aplikacji
tail -f logs/app.log | grep "Daily Hall of Fame"

# Logi systemowe cron
sudo tail -f /var/log/syslog | grep daily-rewards

# Logi custom (jeśli przekierowujesz)
tail -f /var/log/daily-rewards.log
```

---

## 🔧 Troubleshooting

### Częste Problemy:

1. **Brak uprawnień do pliku skryptu**
   ```bash
   chmod +x scripts/daily-rewards.js
   ```

2. **Błąd ścieżki w cron**
   ```bash
   # Użyj pełnych ścieżek
   which node  # /usr/bin/node
   pwd         # /home/user/roast-backend
   ```

3. **Błędy zmiennych środowiskowych w cron**
   ```bash
   # Dodaj na górze crontab
   PATH=/usr/local/bin:/usr/bin:/bin
   NODE_ENV=production
   ```

4. **Insufficient hot wallet balance**
   ```bash
   # Sprawdź balance hot walleta
   node -e "console.log(require('./src/config/app.config').config.zg.hotWalletPrivateKey)"
   ```

5. **Baza danych locked**
   ```bash
   # Sprawdź procesy używające bazy
   lsof data/roast.db
   ```

### Debug Mode:

```bash
# Włącz debug logging
LOG_LEVEL=debug node scripts/test-daily-rewards.js

# Test connection
node -e "
const {config} = require('./src/config/app.config');
console.log('DB Path:', config.database.path);
console.log('Hot Wallet:', config.zg.hotWalletPrivateKey ? 'Configured' : 'Missing');
"
```

---

## 📈 Metryki i Analytics

### Daily Rewards Dashboard (SQL):

```sql
-- Dzienne statystyki nagród
SELECT 
  date,
  COUNT(*) as rewards_given,
  SUM(reward_amount) as total_distributed,
  AVG(reward_amount) as avg_reward
FROM daily_rewards 
GROUP BY date 
ORDER BY date DESC 
LIMIT 30;

-- Top categories by rewards
SELECT 
  category,
  COUNT(*) as times_won,
  SUM(reward_amount) as total_earned,
  AVG(reward_amount) as avg_reward
FROM daily_rewards 
GROUP BY category 
ORDER BY total_earned DESC;

-- Most successful players
SELECT 
  player_address,
  COUNT(*) as total_wins,
  SUM(reward_amount) as total_earned,
  GROUP_CONCAT(DISTINCT category) as categories_won
FROM daily_rewards 
GROUP BY player_address 
ORDER BY total_earned DESC 
LIMIT 20;
```

---

## 🎯 Następne Kroki

1. **Uruchom migrację**: `npm run migrate`
2. **Przetestuj skrypt**: `node scripts/test-daily-rewards.js`
3. **Skonfiguruj cron**: Dodaj zadanie do systemowego cron
4. **Monitoruj logi**: Sprawdź pierwsze uruchomienie
5. **Sprawdź nagrody**: Zweryfikuj pierwsze dystrybucje

**System jest gotowy do produkcji!** 🚀 