# x402 Facilitator - Integración Real

Este documento explica cómo usar el facilitator real implementado para validar y ejecutar pagos x402 on-chain en Avalanche, o cómo configurar el facilitator de Ultravioleta como alternativa.

## Opciones de Facilitator

### Opción 1: Facilitator Local (Recomendado para desarrollo)

Usa el facilitator implementado localmente:

```bash
# 1. Iniciar el facilitator
npm run facilitator

# 2. Configurar en .env del backend
X402_FACILITATOR_URL=http://localhost:3001
```

Ver [FACILITATOR_README.md](./FACILITATOR_README.md) para más detalles.

### Opción 2: Ultravioleta Facilitator (Producción)

Usa el facilitator de Ultravioleta para producción:

```bash
# Ultravioleta Facilitator URL (gasless payments)
# Para testnet (Fuji):
X402_FACILITATOR_URL=https://facilitator.ultravioleta.xyz
# O la URL específica de testnet que te proporcionen
```

### 2. Verificar el Facilitator

Puedes verificar el estado del facilitator con:

```bash
curl http://localhost:3000/api/facilitator/health
```

## Cómo Funciona

### Flujo de Pago

1. **Cliente solicita recurso protegido** sin `X-PAYMENT` header
2. **Servidor responde con 402** incluyendo información de metering:
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

3. **Cliente obtiene payment proof** del facilitator de Ultravioleta (gasless)
4. **Cliente envía request con** `X-PAYMENT: <proof>` header
5. **Servidor valida el proof** con el facilitator de Ultravioleta
6. **Si es válido**, el request procede normalmente

### Validación

El sistema valida los pagos de la siguiente manera:

- **Desarrollo**: Si `X402_FACILITATOR_URL` contiene "mock", acepta `demo-token`
- **Producción**: Valida el proof contra el facilitator de Ultravioleta

## Endpoints

### POST /api/payroll/execute
**Protegido con x402**

Requiere `X-PAYMENT` header con un payment proof válido del facilitator.

**Sin header:**
```bash
curl -X POST http://localhost:3000/api/payroll/execute
# Respuesta: 402 Payment Required
```

**Con payment proof:**
```bash
curl -X POST http://localhost:3000/api/payroll/execute \
  -H "X-PAYMENT: <proof-from-ultravioleta>"
# Respuesta: 200 OK con payroll ejecutado
```

### GET /api/facilitator/health
Verifica el estado del facilitator de Ultravioleta.

```bash
curl http://localhost:3000/api/facilitator/health
```

## Desarrollo vs Producción

### Desarrollo (Mock)
```bash
X402_FACILITATOR_URL=https://facilitator.mock
```
- Acepta `X-PAYMENT: demo-token` para pruebas
- No valida pagos reales

### Testnet/Producción (Ultravioleta)
```bash
X402_FACILITATOR_URL=https://facilitator.ultravioleta.xyz
```
- Valida todos los payment proofs
- Requiere pagos reales on-chain (gasless)
- **NOTA**: Actualmente configurado para Fuji testnet

## Notas

- El facilitator de Ultravioleta permite pagos **gasless**, el usuario no paga gas fees
- Los pagos se validan on-chain pero el facilitator cubre los costos de gas
- El sistema automáticamente detecta si estás usando mock o facilitator real

