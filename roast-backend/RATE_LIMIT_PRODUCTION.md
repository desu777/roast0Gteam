# Rate Limiting Configuration for Production

## Problem Description
The current rate limiting settings are too restrictive for production environment, causing "rate limited" errors for legitimate users.

## Current Issues
- Voting endpoints: 10 requests/minute (too low for active users)
- Vote casting: 2 votes/minute (prevents quick corrections)
- Global rate limit: 100 requests/minute (insufficient for busy periods)

## Fixed in Code
The following changes have been implemented:

### 1. Voting Module (`voting.routes.js`)
- **Voting endpoints**: 50 requests/minute in production (vs 10 in dev)
- **Vote casting**: 5 votes/minute in production (vs 2 in dev)
- **Skip rate limiting** for health checks and stats endpoints in production

### 2. Global Config (`app.config.js`)
- **Global rate limit**: 300 requests/minute in production (vs 100 in dev)

## Recommended Environment Variables

Add these to your production `.env` file for additional fine-tuning:

```bash
# Global Rate Limiting
RATE_LIMIT_WINDOW_MS=60000          # 1 minute window
RATE_LIMIT_MAX_REQUESTS=300         # 300 requests per minute per IP

# Production specific overrides
NODE_ENV=production                  # Enables production rate limits
```

## Rate Limiting Summary by Module

| Module | Endpoint Type | Dev Limit | Production Limit |
|--------|---------------|-----------|-----------------|
| Global | All APIs | 100/min | 300/min |
| Voting | General | 10/min | 50/min |
| Voting | Vote casting | 2/min | 5/min |
| Players | General | 30/min | 30/min |
| AI | General | 20/min | 20/min |
| AI | Evaluation | 2/min | 2/min |

## Additional Production Tips

1. **Monitor logs** for rate limit hits:
   ```bash
   tail -f logs/app.log | grep "rate limit"
   ```

2. **Consider using Redis** for distributed rate limiting if running multiple instances

3. **Implement user-based rate limiting** instead of just IP-based for better UX

4. **Add rate limit headers** to help frontend handle limits gracefully

## Testing
After deployment, verify the changes work:
```bash
# Test voting stats endpoint (should allow more requests now)
for i in {1..20}; do curl -s "https://your-api.com/api/voting/stats/1" | jq .success; done

# Test vote casting (should allow up to 5 votes per minute)
curl -X POST "https://your-api.com/api/voting/vote" -H "Content-Type: application/json" -d '{"roundId":1,"characterId":"michael","voterAddress":"0x1234..."}'
```

## Rollback
If issues occur, you can temporarily disable rate limiting by setting:
```bash
RATE_LIMIT_MAX_REQUESTS=999999
``` 