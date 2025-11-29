# x402 Facilitator - Real Integration

This document explains how to use the real facilitator implementation to validate and execute x402 payments on-chain on Avalanche, or how to configure the Ultravioleta facilitator as an alternative.

## Facilitator Options

### Option 1: Local Facilitator (Recommended for development)

Use the locally implemented facilitator:

```bash
# 1. Start the facilitator
npm run facilitator

# 2. Configure in backend .env
X402_FACILITATOR_URL=http://localhost:3001
```

See [FACILITATOR_README.md](./FACILITATOR_README.md) for more details.

### Option 2: Ultravioleta Facilitator (Production)

Use the Ultravioleta facilitator for production:

```bash
# Ultravioleta Facilitator URL (gasless payments)
# For testnet (Fuji):
X402_FACILITATOR_URL=https://facilitator.ultravioleta.xyz
# Or the specific testnet URL they provide
```

### 2. Verify the Facilitator

You can verify the facilitator status with:

```bash
curl http://localhost:3000/api/facilitator/health
```

## How It Works

### Payment Flow

1. **Client requests protected resource** without `X-PAYMENT` header
2. **Server responds with 402** including metering information:
   ```json
   {
     "error": "PAYMENT_REQUIRED",
     "meterId": "payroll_execute",
     "metering": {
       "price": "1",
       "asset": "USDC",
       "chain": "fuji",
       "resource": "payroll_execution",
       "version": "8004-alpha"
     }
   }
   ```

3. **Client obtains payment proof** from Ultravioleta facilitator (gasless)
4. **Client sends request with** `X-PAYMENT: <proof>` header
5. **Server validates the proof** with Ultravioleta facilitator
6. **If valid**, the request proceeds normally

### Validation

The system validates payments as follows:

- **Development**: If `X402_FACILITATOR_URL` contains "mock", accepts `demo-token`
- **Production**: Validates the proof against Ultravioleta facilitator

## Endpoints

### POST /api/payroll/execute
**Protected with x402**

Requires `X-PAYMENT` header with a valid payment proof from the facilitator.

**Without header:**
```bash
curl -X POST http://localhost:3000/api/payroll/execute
# Response: 402 Payment Required
```

**With payment proof:**
```bash
curl -X POST http://localhost:3000/api/payroll/execute \
  -H "X-PAYMENT: <proof-from-ultravioleta>"
# Response: 200 OK with executed payroll
```

### GET /api/facilitator/health
Checks the status of the Ultravioleta facilitator.

```bash
curl http://localhost:3000/api/facilitator/health
```

## Development vs Production

### Development (Mock)
```bash
X402_FACILITATOR_URL=https://facilitator.mock
```
- Accepts `X-PAYMENT: demo-token` for testing
- Doesn't validate real payments

### Testnet/Production (Ultravioleta)
```bash
X402_FACILITATOR_URL=https://facilitator.ultravioleta.xyz
```
- Validates all payment proofs
- Requires real on-chain payments (gasless)
- **NOTE**: Currently configured for Fuji testnet

## Notes

- The Ultravioleta facilitator allows **gasless** payments, the user doesn't pay gas fees
- Payments are validated on-chain but the facilitator covers gas costs
- The system automatically detects if you're using mock or real facilitator
