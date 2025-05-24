# 💰 Treasury API Documentation

## Overview

Treasury API handles all 0G cryptocurrency transactions for the Roast Arena game, including entry fee verification and prize payouts.

## Base URL
```
/api/treasury
```

## Authentication

- **Public endpoints**: No authentication required
- **Admin endpoints**: Require admin authentication (TODO: implement middleware)

---

## 📋 **Public Endpoints**

### GET /config
Get treasury configuration and network details.

**Response:**
```json
{
  "network": {
    "name": "0G-Galileo-Testnet",
    "chainId": 16601,
    "rpc": "https://evmrpc-testnet.0g.ai",
    "explorer": "https://chainscan-galileo.0g.ai/",
    "currency": {
      "symbol": "0G",
      "decimals": 18
    }
  },
  "game": {
    "entryFee": 0.025,
    "houseFeePercentage": 5,
    "treasuryAddress": "0x..."
  }
}
```

### GET /health
Check treasury service health status.

**Response:**
```json
{
  "status": "healthy",
  "provider": {
    "connected": true,
    "network": "0G-Galileo-Testnet",
    "chainId": 16601
  },
  "hotWallet": {
    "ready": true,
    "balance": "10.5",
    "currency": "0G"
  },
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### GET /balance/:address
Get 0G balance for wallet address.

**Parameters:**
- `address` (string): Wallet address (0x...)

**Response:**
```json
{
  "address": "0x742d35Cc6634C0532925a3b844Bc9e759...",
  "balance": "1.25",
  "currency": "0G",
  "network": "0G-Galileo-Testnet"
}
```

### POST /verify-payment
Verify entry fee payment transaction.

**Request Body:**
```json
{
  "txHash": "0x1234567890abcdef...",
  "playerAddress": "0x742d35Cc6634C0532925a3b844Bc9e759...",
  "roundId": "round-123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "txHash": "0x1234567890abcdef...",
  "amount": "0.025",
  "currency": "0G",
  "blockNumber": 12345
}
```

**Error Response:**
```json
{
  "error": true,
  "message": "Incorrect amount. Expected: 0.025 0G, Got: 0.02 0G",
  "txHash": "0x1234567890abcdef..."
}
```

### GET /payments/:address
Get payment history for player.

**Parameters:**
- `address` (string): Player wallet address
- `limit` (optional, default: 10): Number of records
- `offset` (optional, default: 0): Records offset

**Response:**
```json
{
  "payments": [
    {
      "txHash": "0x1234567890abcdef...",
      "roundId": "round-123",
      "amount": "0.025",
      "blockNumber": 12345,
      "timestamp": "2025-01-27T10:30:00.000Z",
      "confirmed": true,
      "currency": "0G"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## 🔐 **Admin Endpoints**

### GET /stats
Get treasury statistics (admin only).

**Response:**
```json
{
  "treasury": {
    "hotWalletBalance": "10.5",
    "treasuryBalance": "25.75",
    "totalPaymentsReceived": 156.25,
    "totalPaymentCount": 6250,
    "totalPayoutsSent": 148.44,
    "totalPayoutCount": 5937,
    "totalHouseFees": 7.81,
    "netProfit": 7.81,
    "currency": "0G",
    "network": "0G-Galileo-Testnet",
    "entryFee": 0.025,
    "houseFeePercentage": 5
  }
}
```

### POST /payout
Process prize payout (admin only).

**Request Body:**
```json
{
  "winnerAddress": "0x742d35Cc6634C0532925a3b844Bc9e759...",
  "roundId": "round-123",
  "prizeAmount": 0.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prize payout completed successfully",
  "txHash": "0xabcdef1234567890...",
  "amount": 0.475,
  "currency": "0G",
  "winnerAddress": "0x742d35Cc6634C0532925a3b844Bc9e759...",
  "roundId": "round-123"
}
```

---

## 🎮 **Integration Flow**

### 1. Entry Fee Flow
```
1. Player initiates 0.025 0G transaction to treasury address
2. Frontend gets transaction hash
3. Frontend calls POST /verify-payment with tx details
4. Backend verifies transaction on 0G blockchain
5. If valid, player is added to game round
```

### 2. Prize Payout Flow
```
1. Game round completes with winner
2. Backend calculates prize (total pool - 5% house fee)
3. Backend calls treasury service to send payout
4. Hot wallet automatically sends 0G to winner
5. Transaction is recorded in database
```

### 3. Balance Check Flow
```
1. Frontend calls GET /balance/:address
2. Real-time balance fetched from 0G Network
3. Displayed to player before joining game
```

---

## 🔧 **Configuration**

### Environment Variables

```bash
# 0G Network Configuration
ZERO_G_NETWORK_RPC=https://evmrpc-testnet.0g.ai
ZERO_G_CHAIN_ID=16601
ZERO_G_NETWORK_NAME="0G-Galileo-Testnet"
ZERO_G_EXPLORER=https://chainscan-galileo.0g.ai/
ZERO_G_CURRENCY_SYMBOL=0G
ZERO_G_CURRENCY_DECIMALS=18

# Treasury Wallet Configuration
TREASURY_PRIVATE_KEY=your-treasury-private-key-here
TREASURY_PUBLIC_ADDRESS=your-treasury-public-address-here

# Game Configuration
ZG_ENTRY_FEE=0.025
ZG_HOUSE_FEE_PERCENTAGE=5
```

### Database Tables

**payments**
- Tracks all entry fee payments
- Links to player address and round

**payouts**
- Tracks all prize payouts to winners
- Records house fees taken

---

## 🚨 **Error Codes**

| Code | Message | Description |
|------|---------|-------------|
| 400 | Invalid wallet address format | Address not in 0x format |
| 400 | Invalid transaction hash format | TX hash not 64 chars hex |
| 400 | Transaction not found | TX not on blockchain |
| 400 | Transaction failed | TX status failed |
| 400 | Incorrect recipient address | Not sent to treasury |
| 400 | Incorrect amount | Not exactly 0.025 0G |
| 400 | Transaction too old | Older than 5 minutes |
| 500 | Hot wallet not initialized | Private key missing |
| 500 | Insufficient hot wallet balance | Not enough 0G for payout |

---

## 🔒 **Security Features**

1. **Transaction Verification**: All payments verified on-chain
2. **Amount Validation**: Exact entry fee amount required
3. **Recency Check**: Transactions must be < 5 minutes old
4. **Address Validation**: Proper wallet address format
5. **Hot Wallet Security**: Private key in environment variables
6. **Database Integrity**: All transactions recorded with hashes

---

## 📊 **Monitoring**

- Real-time balance monitoring
- Transaction confirmation tracking
- Failed payment alerts
- Hot wallet balance warnings
- Network connectivity status 