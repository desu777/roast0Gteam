# 🚀 Prosty Poradnik Deployment - 0G Contract Slot Machine

## 📋 Konfiguracja Domen

- **Frontend**: `deployer.desu0g.xyz` (port 3998)
- **Compiler**: `compiler.desu0g.xyz` (port 3999)
- **Lokalizacja**: `/var/www/deployer`
- **Repo**: https://github.com/desu777/0G-Galileo-Deployer

## 🔧 Krok 1: Przygotowanie VPS

### 1.1 Aktualizacja systemu
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Instalacja Node.js 18+
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 1.3 Instalacja PM2 i Nginx
```bash
sudo npm install -g pm2
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 📦 Krok 2: Klonowanie Projektu

```bash
cd /var/www
sudo git clone https://github.com/desu777/0G-Galileo-Deployer deployer
sudo chown -R $USER:$USER /var/www/deployer
cd /var/www/deployer
```

## ⚙️ Krok 3: Konfiguracja Frontend

### 3.1 Instalacja i build
```bash
npm install
```

### 3.2 Konfiguracja .env
```bash
cp env.example .env
nano .env
```

**Zawartość .env:**
```env
NODE_ENV=production
VITE_TEST_ENV=false
VITE_WALLETCONNECT_PROJECT_ID=twoj_project_id_z_walletconnect
VITE_COMPILER_API_URL=https://compiler.desu0g.xyz
VITE_0G_RPC_URL=https://evmrpc-testnet.0g.ai
VITE_0G_EXPLORER_URL=https://chainscan-galileo.0g.ai
VITE_APP_NAME=0G Contract Slot Machine
VITE_APP_VERSION=1.0.0
```

### 3.3 Build frontend
```bash
npm run build:prod
```

## 🔨 Krok 4: Konfiguracja Compiler

### 4.1 Setup compiler
```bash
cd /var/www/deployer/compiler
npm install
```

### 4.2 Konfiguracja compiler/.env
```bash
cp env.example .env
nano .env
```

**Zawartość compiler/.env:**
```env
PORT=3999
NODE_ENV=production
FRONTEND_URL=https://deployer.desu0g.xyz
DEBUG=false
SOLC_VERSION=0.8.20
OPTIMIZER_ENABLED=true
OPTIMIZER_RUNS=200
ENABLE_CORS=true
REQUEST_SIZE_LIMIT=10mb
COMPILATION_TIMEOUT=30000
```

### 4.3 Build compiler
```bash
npm run build:prod
```

## 🚀 Krok 5: PM2 Configuration

### 5.1 Utwórz ecosystem.config.cjs
```bash
cd /var/www/deployer
nano ecosystem.config.cjs
```

**Zawartość:**
```javascript
module.exports = {
  apps: [
    {
      name: 'deployer-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/var/www/deployer',
      env: {
        NODE_ENV: 'production',
        PORT: 3998
      }
    },
    {
      name: 'deployer-compiler',
      script: 'dist/server.js',
      cwd: '/var/www/deployer/compiler',
      env: {
        NODE_ENV: 'production',
        PORT: 3999
      }
    }
  ]
};
```

### 5.2 Uruchom aplikacje
```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

**Ważne:** Jeśli frontend uruchamia się na złym porcie (4173), zatrzymaj PM2, przebuduj i uruchom ponownie:
```bash
# Zatrzymaj aplikacje
pm2 stop all

# Przebuduj frontend z nową konfiguracją portów
npm run build:prod

# Uruchom ponownie
pm2 start ecosystem.config.cjs
```

## 🌐 Krok 6: Nginx Configuration

### 6.1 Frontend - deployer.desu0g.xyz
```bash
sudo nano /etc/nginx/sites-available/deployer.desu0g.xyz
```

**Zawartość:**
```nginx
server {
    listen 80;
    server_name deployer.desu0g.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name deployer.desu0g.xyz;

    # SSL certificates (będą dodane przez Certbot)
    
    location / {
        proxy_pass http://localhost:3998;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 6.2 Compiler - compiler.desu0g.xyz
```bash
sudo nano /etc/nginx/sites-available/compiler.desu0g.xyz
```

**Zawartość:**
```nginx
server {
    listen 80;
    server_name compiler.desu0g.xyz;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name compiler.desu0g.xyz;

    # SSL certificates (będą dodane przez Certbot)
    
    location / {
        proxy_pass http://localhost:3999;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Extended timeouts for compilation
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
        proxy_read_timeout 120s;
        
        # Increase body size for large contracts
        client_max_body_size 10M;
    }
}
```

### 6.3 Aktywacja konfiguracji
```bash
sudo ln -s /etc/nginx/sites-available/deployer.desu0g.xyz /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/compiler.desu0g.xyz /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔒 Krok 7: SSL Certificates

### 7.1 Instalacja Certbot
```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 7.2 Generowanie certyfikatów
```bash
# Frontend SSL
sudo certbot --nginx -d deployer.desu0g.xyz

# Compiler SSL
sudo certbot --nginx -d compiler.desu0g.xyz
```

## 🔥 Krok 8: Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

## ✅ Krok 9: Weryfikacja

### 9.1 Sprawdzenie PM2
```bash
pm2 status
pm2 logs
```

### 9.2 Test endpointów
```bash
# Frontend
curl -I https://deployer.desu0g.xyz

# Compiler health check
curl https://compiler.desu0g.xyz/health
```

### 9.3 Test CORS
```bash
curl -H "Origin: https://deployer.desu0g.xyz" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://compiler.desu0g.xyz/api/compile/health
```

## 🔄 Krok 10: Skrypt Update

### 10.1 Utwórz skrypt aktualizacji
```bash
nano /var/www/deployer/update.sh
chmod +x /var/www/deployer/update.sh
```

**Zawartość update.sh:**
```bash
#!/bin/bash

echo "🚀 Updating 0G Contract Slot Machine..."

cd /var/www/deployer

# Pull latest changes
git pull origin main

# Update frontend
echo "🔨 Building frontend..."
npm install
npm run build:prod

# Update compiler
echo "🔨 Building compiler..."
cd compiler
npm install
npm run build:prod
cd ..

# Restart applications
echo "🔄 Restarting services..."
pm2 restart all

# Check status
pm2 status

echo "✅ Update completed!"
echo "🌐 Frontend: https://deployer.desu0g.xyz"
echo "🔧 Compiler: https://compiler.desu0g.xyz"
```

## 📋 Checklist

- [ ] VPS z Ubuntu 20.04/22.04
- [ ] Node.js 18+ zainstalowany
- [ ] PM2 i Nginx zainstalowane
- [ ] Repo sklonowane do `/var/www/deployer`
- [ ] Frontend `.env` skonfigurowany z WalletConnect PROJECT_ID
- [ ] Compiler `.env` skonfigurowany
- [ ] PM2 ecosystem.config.cjs utworzony
- [ ] Obie aplikacje uruchomione przez PM2
- [ ] Nginx konfiguracje utworzone dla obu domen
- [ ] SSL certyfikaty wygenerowane dla obu domen
- [ ] DNS wskazuje na VPS IP dla obu domen:
  - `deployer.desu0g.xyz` → VPS IP
  - `compiler.desu0g.xyz` → VPS IP
- [ ] Firewall skonfigurowany
- [ ] Wszystkie endpointy działają
- [ ] CORS działa między domenami

## 🎯 Finalne Rezultaty

**Po pomyślnym deployment:**

1. **Frontend**: https://deployer.desu0g.xyz
2. **Compiler API**: https://compiler.desu0g.xyz/health
3. **Cross-domain CORS**: Skonfigurowany
4. **Auto-SSL**: Let's Encrypt dla obu domen
5. **PM2 Monitoring**: `pm2 status`

**Ważne konfiguracje:**
- `VITE_WALLETCONNECT_PROJECT_ID` w frontend/.env
- DNS A records dla obu domen wskazujące na VPS IP
- CORS w nginx i Express dla cross-domain requests

🎉 **Gotowe! Aplikacja działa na dwóch domenach z pełnym CORS support!** 