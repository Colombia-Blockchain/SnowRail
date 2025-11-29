# x402 Facilitator Server

Servidor facilitator real para validar y ejecutar pagos x402 on-chain en Avalanche.

## Características

- ✅ Validación de payment proofs on-chain
- ✅ Verificación de firmas EIP-3009
- ✅ Settlement de pagos on-chain (gasless)
- ✅ Compatible con MerchantExecutor
- ✅ Soporte para Avalanche Fuji testnet
- ✅ Health checks y logging

## Instalación y Uso

### 1. Configurar Variables de Entorno

En tu archivo `.env`:

```bash
# Network configuration
NETWORK=fuji

# RPC URL para Avalanche Fuji testnet
RPC_URL_AVALANCHE=https://api.avax-test.network/ext/bc/C/rpc

# Private key para ejecutar settlements (opcional, solo si quieres que el facilitator ejecute pagos)
PRIVATE_KEY=0xTU_PRIVATE_KEY_AQUI

# Puerto del facilitator (opcional, default: 3001)
FACILITATOR_PORT=3001
```

### 2. Compilar y Ejecutar

```bash
# Compilar TypeScript
npm run build

# Ejecutar facilitator
npm run facilitator

# O en modo desarrollo (recompila y ejecuta)
npm run facilitator:dev
```

El facilitator estará disponible en `http://localhost:3001`

### 3. Configurar el Backend para Usar el Facilitator Local

En el `.env` del backend:

```bash
# Usar facilitator local
X402_FACILITATOR_URL=http://localhost:3001
```

## Endpoints

### GET /health
Health check del facilitator

```bash
curl http://localhost:3001/health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "network": "fuji",
  "timestamp": "2025-11-29T..."
}
```

### POST /validate
Valida un payment proof

```bash
curl -X POST http://localhost:3001/validate \
  -H "Content-Type: application/json" \
  -d '{
    "proof": "{\"from\":\"0x...\",\"to\":\"0x...\",\"value\":\"1000000\",\"signature\":\"0x...\"}",
    "meterId": "payroll_execute",
    "price": "1",
    "asset": "USDC",
    "chain": "fuji"
  }'
```

**Respuesta exitosa:**
```json
{
  "valid": true,
  "payer": "0x...",
  "amount": "1000000"
}
```

### POST /verify
Verifica un pago (compatible con MerchantExecutor)

```bash
curl -X POST http://localhost:3001/verify \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": 1,
    "paymentPayload": {...},
    "paymentRequirements": {...}
  }'
```

### POST /settle
Ejecuta el settlement on-chain (requiere PRIVATE_KEY)

```bash
curl -X POST http://localhost:3001/settle \
  -H "Content-Type: application/json" \
  -d '{
    "x402Version": 1,
    "paymentPayload": {...},
    "paymentRequirements": {...}
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "transactionHash": "0x...",
  "payer": "0x...",
  "amount": "1000000"
}
```

## Arquitectura

```
┌─────────────┐
│   Cliente   │
│  (Agente)   │
└──────┬──────┘
       │
       │ X-PAYMENT header
       ▼
┌─────────────┐
│   Backend   │
│  (API)      │
└──────┬──────┘
       │
       │ POST /validate
       ▼
┌─────────────┐
│ Facilitator │
│  Server     │
└──────┬──────┘
       │
       │ Verifica on-chain
       ▼
┌─────────────┐
│  Avalanche  │
│  (Fuji)     │
└─────────────┘
```

## Validación de Pagos

El facilitator valida:

1. **Formato del proof**: Debe contener `from`, `to`, `value`, `signature`
2. **Monto**: Debe ser igual o mayor al precio del meter
3. **Firma**: Verifica la firma EIP-3009 (simplificada para testnet)
4. **Nonce**: Previene replay attacks (implementación básica)

## Settlement On-Chain

Si `PRIVATE_KEY` está configurado, el facilitator puede ejecutar `transferWithAuthorization` on-chain:

- Ejecuta la transacción usando la private key configurada
- Retorna el hash de la transacción
- El usuario no paga gas (gasless)

## Desarrollo vs Producción

### Testnet (Fuji)
- Validación de firmas simplificada
- Acepta `demo-token` para pruebas
- No requiere verificación estricta de nonces

### Producción (Mainnet)
- Verificación completa de firmas EIP-712
- Verificación de nonces contra base de datos
- Validación estricta de todos los campos

## Troubleshooting

### El facilitator no inicia
- Verifica que el puerto 3001 esté disponible
- Revisa los logs para errores de configuración

### Validación falla
- Verifica que el RPC URL esté correcto
- Asegúrate de que el proof tenga el formato correcto
- Revisa que el monto sea suficiente

### Settlement falla
- Verifica que `PRIVATE_KEY` esté configurado
- Asegúrate de tener AVAX para gas en la wallet
- Revisa que el contrato ERC20 soporte `transferWithAuthorization`

## Referencias

- [x402 Protocol Documentation](https://x402.org)
- [Avalanche Build Docs](https://build.avax.network)
- [EIP-3009 Specification](https://eips.ethereum.org/EIPS/eip-3009)

